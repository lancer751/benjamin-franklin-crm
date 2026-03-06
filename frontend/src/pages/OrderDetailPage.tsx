import { useParams, Link } from "react-router-dom";
import { ordersApi } from "@/api/orders";
import { useFetch } from "@/hooks/useFetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

const estadoColor: Record<string, string> = {
  pendiente: "bg-warning text-warning-foreground",
  pagado: "bg-success text-success-foreground",
  cancelado: "bg-destructive text-destructive-foreground",
  reembolsado: "bg-muted text-muted-foreground",
  confirmado: "bg-success text-success-foreground",
  rechazado: "bg-destructive text-destructive-foreground",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, loading } = useFetch(() => ordersApi.getById(id!), [id]);

  if (loading) return <p className="text-muted-foreground p-6">Cargando…</p>;
  if (!order) return <p className="text-destructive p-6">Orden no encontrada.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Orden
        </h1>
        <Badge className={estadoColor[order.estado_order] || ""}>{order.estado_order}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Cliente:</span>{" "}
              <span className="font-medium">{order.cliente.fullname}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Vendedor:</span>{" "}
              <span className="font-medium">{order.vendedor?.fullname || "—"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total:</span>{" "}
              <span className="font-bold">
                S/ {Number(order.costo_total).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Productos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Modalidad</TableHead>
                <TableHead>Precio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.order_detail.map((d, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{d.course_name}</TableCell>
                  <TableCell className="capitalize">{d.modalidad}</TableCell>
                  <TableCell>S/ {Number(d.precio).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pagos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {order.pagos.length === 0 ? (
            <p className="text-muted-foreground text-sm p-6">Sin pagos registrados.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Método</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.pagos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="capitalize">{p.metodo_pago}</TableCell>
                    <TableCell>S/ {Number(p.cantidad).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={estadoColor[p.estado] || ""}>{p.estado}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString("es-PE") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
