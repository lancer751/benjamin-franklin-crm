import { useEffect, useState } from "react";
import { dashboardApi } from "@/api/dashboard";
import type { DashboardPayment } from "@/types/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, CheckCircle, Clock, DollarSign } from "lucide-react";

const statusColor: Record<string, string> = {
  confirmado: "bg-success text-success-foreground",
  pendiente: "bg-warning text-warning-foreground",
  rechazado: "bg-destructive text-destructive-foreground",
  reembolsado: "bg-muted text-muted-foreground",
};

export default function DashboardPage() {
  const [payments, setPayments] = useState<DashboardPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .getPayments()
      .then((res) => setPayments(res.payments))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const confirmed = payments.filter((p) => p.estado === "confirmado");
  const pending = payments.filter((p) => p.estado === "pendiente");
  const totalAmount = confirmed.reduce((s, p) => s + p.cantidad, 0);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pagos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmados</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmed.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pending.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Confirmados</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              S/ {totalAmount.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pagos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm py-4">Cargando…</p>
          ) : payments.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No hay pagos registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Curso(s)</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.slice(0, 20).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {p.cliente.nombre} {p.cliente.apellido_paterno}
                      </TableCell>
                      <TableCell className="text-sm">
                        {p.cursos.map((c) => c.nombre).join(", ") || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{p.metodoPago}</Badge>
                      </TableCell>
                      <TableCell>
                        S/ {p.cantidad.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColor[p.estado] || ""}>{p.estado}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.fechaPago ? new Date(p.fechaPago).toLocaleDateString("es-PE") : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
