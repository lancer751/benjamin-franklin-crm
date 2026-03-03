import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Download,
  CreditCard,
  ArrowUpDown,
  CalendarIcon,
  Receipt,
} from "lucide-react";
import { mockPayments, mockStudents, mockCourses } from "@/lib/mock-data";
import { PaymentStatus, PaymentMethod } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 10;

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, { label: string; className: string }> = {
    PAID: { label: "Pagado", className: "bg-success/15 text-success border-success/20" },
    PENDING: { label: "Pendiente", className: "bg-warning/15 text-warning border-warning/20" },
    FAILED: { label: "Fallido", className: "bg-destructive/15 text-destructive border-destructive/20" },
    REFUNDED: { label: "Reembolsado", className: "bg-muted text-muted-foreground border-border" },
  };
  const cfg = map[status];
  return <Badge className={`${cfg.className} border text-xs`}>{cfg.label}</Badge>;
}

function PaymentMethodBadge({ method }: { method: PaymentMethod }) {
  const map: Record<PaymentMethod, string> = {
    CARD: "Tarjeta",
    YAPE: "Yape",
    TRANSFER: "Transferencia",
    CASH: "Efectivo",
  };
  return <Badge variant="outline" className="text-xs">{map[method]}</Badge>;
}

type SortField = "paymentDate" | "amount";
type SortDir = "asc" | "desc";

const EnrollmentsPage = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("paymentDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const enriched = useMemo(() => {
    return mockPayments.map((p) => {
      const student = mockStudents.find((s) => s.id === p.studentId);
      const course = mockCourses.find((c) => c.id === p.courseId);
      return { ...p, studentName: student?.fullName ?? "—", studentEmail: student?.email ?? "—", courseName: course?.name ?? "—" };
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return enriched
      .filter((p) => {
        const matchSearch =
          !q ||
          p.studentName.toLowerCase().includes(q) ||
          p.studentEmail.toLowerCase().includes(q) ||
          p.transactionId.toLowerCase().includes(q);
        const matchCourse = courseFilter === "all" || String(p.courseId) === courseFilter;
        const matchMethod = methodFilter === "all" || p.paymentMethod === methodFilter;
        const matchStatus = statusFilter === "all" || p.paymentStatus === statusFilter;
        return matchSearch && matchCourse && matchMethod && matchStatus;
      })
      .sort((a, b) => {
        const mult = sortDir === "asc" ? 1 : -1;
        if (sortField === "amount") return (a.amount - b.amount) * mult;
        return (new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()) * mult;
      });
  }, [enriched, search, courseFilter, methodFilter, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const handleExportCSV = () => {
    const headers = ["Estudiante", "Email", "Curso", "Método", "Estado", "Transacción", "Monto", "Moneda", "Fecha Pago"];
    const rows = filtered.map((p) => [
      p.studentName, p.studentEmail, p.courseName,
      p.paymentMethod, p.paymentStatus, p.transactionId,
      p.amount.toFixed(2), p.currency,
      new Date(p.paymentDate).toLocaleDateString("es-PE"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `enrollments_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exportado", description: `${filtered.length} registros exportados.` });
  };

  // KPIs
  const totalAmount = enriched.filter((p) => p.paymentStatus === "PAID").reduce((s, p) => s + p.amount, 0);
  const paidCount = enriched.filter((p) => p.paymentStatus === "PAID").length;
  const pendingCount = enriched.filter((p) => p.paymentStatus === "PENDING").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Matrículas y Pagos</h1>
          <p className="mt-1 text-muted-foreground">Revisión de transacciones y estados de pago.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{enriched.length}</p>
              <p className="text-xs text-muted-foreground">Total transacciones</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
              <CreditCard className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{paidCount}</p>
              <p className="text-xs text-muted-foreground">Pagados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
              <CalendarIcon className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Pendientes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
              <CreditCard className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">S/ {totalAmount.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Total cobrado</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <Receipt className="h-5 w-5 text-primary" />
            Listado de Transacciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o transacción..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={courseFilter} onValueChange={(v) => { setCourseFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Todos los cursos" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                <SelectItem value="all">Todos los cursos</SelectItem>
                {mockCourses.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={(v) => { setMethodFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los métodos</SelectItem>
                <SelectItem value="CARD">Tarjeta</SelectItem>
                <SelectItem value="YAPE">Yape</SelectItem>
                <SelectItem value="TRANSFER">Transferencia</SelectItem>
                <SelectItem value="CASH">Efectivo</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Estado de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="PAID">Pagado</SelectItem>
                <SelectItem value="PENDING">Pendiente</SelectItem>
                <SelectItem value="FAILED">Fallido</SelectItem>
                <SelectItem value="REFUNDED">Reembolsado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Transacción</TableHead>
                  <TableHead>
                    <button className="flex items-center gap-1" onClick={() => toggleSort("amount")}>
                      Monto <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button className="flex items-center gap-1" onClick={() => toggleSort("paymentDate")}>
                      Fecha Pago <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      No se encontraron transacciones.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{p.studentName}</p>
                          <p className="text-xs text-muted-foreground">{p.studentEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm max-w-[180px] truncate">{p.courseName}</TableCell>
                      <TableCell><PaymentMethodBadge method={p.paymentMethod} /></TableCell>
                      <TableCell><PaymentStatusBadge status={p.paymentStatus} /></TableCell>
                      <TableCell className="font-mono text-xs">{p.transactionId}</TableCell>
                      <TableCell className="font-medium text-sm">S/ {p.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-sm">{new Date(p.paymentDate).toLocaleDateString("es-PE")}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Anterior</Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnrollmentsPage;
