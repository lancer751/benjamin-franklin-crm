import { useState } from "react";
import { reportsApi } from "@/api/reports";
import { coursesApi } from "@/api/courses";
import { useFetch } from "@/hooks/useFetch";
import type { SalesReport } from "@/types/report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";

const methods = ["", "efectivo", "transferencia", "pos", "online", "yape"];

export default function ReportsPage() {
  const { data: coursesData } = useFetch(() => coursesApi.getAll(1, 100), []);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Ingrese fechas de inicio y fin");
      return;
    }
    setLoading(true);
    try {
      const params: { startDate: string; endDate: string; courseId?: string; paymentMethod?: string } = { startDate, endDate };
      if (courseId) params.courseId = courseId;
      if (paymentMethod) params.paymentMethod = paymentMethod;
      const data = await reportsApi.getSales(params);
      setReport(data);
    } catch (err: unknown) {
      let message = "Error al generar reporte";

      if (err instanceof Error) {
        message = err.message;
      }

      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const maybeAxiosError = err as {
          response?: { data?: { error?: string } };
        };

        message =
          maybeAxiosError.response?.data?.error ?? message;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const courses = coursesData?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Reportes de Ventas</h1>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-end">
            <div className="grid gap-1.5">
              <Label>Fecha Inicio</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Fecha Fin</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Curso</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Método Pago</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                <SelectContent>
                  {methods.map((m) => (
                    <SelectItem key={m || "all"} value={m || "all"}>
                      {m || "Todos"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchReport} disabled={loading}>
              {loading ? "Cargando…" : "Generar Reporte"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Ingresos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  S/ {report.summary.totalRevenue.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Pagos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.summary.totalPayments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Matrículas Completadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.summary.totalCompletedEnrollments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Cursos con Ingreso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{report.summary.uniqueCoursesWithRevenue}</div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue per course */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ingresos por Curso</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Curso</TableHead>
                    <TableHead>Ingresos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.revenuePerCourse.map((r) => (
                    <TableRow key={r.cursoId}>
                      <TableCell className="font-medium">{r.cursoNombre}</TableCell>
                      <TableCell>
                        S/ {r.totalRevenue.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Revenue per month */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ingresos por Mes</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mes</TableHead>
                    <TableHead>Ingresos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.revenuePerMonth.map((r) => (
                    <TableRow key={r.month}>
                      <TableCell className="font-medium">{r.month}</TableCell>
                      <TableCell>
                        S/ {r.totalRevenue.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment method distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribución por Método de Pago</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Método</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.paymentMethodDistribution.map((r) => (
                    <TableRow key={r.method}>
                      <TableCell className="font-medium capitalize">{r.method}</TableCell>
                      <TableCell>{r.count}</TableCell>
                      <TableCell>
                        S/ {r.totalAmount.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
