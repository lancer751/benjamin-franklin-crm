import { useState } from "react";
import { Link } from "react-router-dom";
import { ordersApi } from "@/api/orders";
import { customersApi } from "@/api/customers";
import { productsApi } from "@/api/products";
import { useFetch } from "@/hooks/useFetch";
import type { CreateOrderData } from "@/types/order";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

const estadoColor: Record<string, string> = {
  pendiente: "bg-warning text-warning-foreground",
  pagado: "bg-success text-success-foreground",
  cancelado: "bg-destructive text-destructive-foreground",
  reembolsado: "bg-muted text-muted-foreground",
};

export default function OrdersPage() {
  const { data: orders, loading, refetch } = useFetch(() => ordersApi.getAll(), []);
  const { data: customers } = useFetch(() => customersApi.getAll(), []);
  const { data: products } = useFetch(() => productsApi.getAll(), []);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<
    { producto_id: string; costo_unitario: number }[]
  >([]);
  const [saving, setSaving] = useState(false);

  const addProduct = (productId: string) => {
    const prod = (products || []).find((p) => p.id === productId);
    if (!prod || selectedProducts.some((s) => s.producto_id === productId)) return;
    setSelectedProducts([
      ...selectedProducts,
      { producto_id: prod.id, costo_unitario: Number(prod.precio) },
    ]);
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter((s) => s.producto_id !== productId));
  };

  const handleCreate = async () => {
    if (!clienteId || selectedProducts.length === 0) {
      toast.error("Seleccione un cliente y al menos un producto");
      return;
    }
    setSaving(true);
    try {
      const data: CreateOrderData = { cliente_id: clienteId, detalles: selectedProducts };
      await ordersApi.create(data);
      toast.success("Orden creada");
      setDialogOpen(false);
      setClienteId("");
      setSelectedProducts([]);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error al crear orden");
    } finally {
      setSaving(false);
    }
  };

  const total = selectedProducts.reduce((s, p) => s + p.costo_unitario, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Órdenes</h1>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Nueva Orden
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-muted-foreground text-sm p-6">Cargando…</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(orders || []).map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.cliente.fullname}</TableCell>
                      <TableCell>{o.vendedor?.fullname || "—"}</TableCell>
                      <TableCell>
                        S/ {Number(o.costo_total).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge className={estadoColor[o.estado_order] || ""}>
                          {o.estado_order}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("es-PE")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/orders/${o.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(orders || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No hay órdenes.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Order Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Orden</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label>Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {(customers || []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre} {c.apellido_paterno} — {c.dni}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label>Agregar Producto</Label>
              <Select onValueChange={addProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {(products || []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.coursename} — {p.modalidad} — S/ {Number(p.precio).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProducts.length > 0 && (
              <div className="border rounded-lg p-3 space-y-2">
                {selectedProducts.map((sp) => {
                  const prod = (products || []).find((p) => p.id === sp.producto_id);
                  return (
                    <div key={sp.producto_id} className="flex items-center justify-between text-sm">
                      <span>{prod?.coursename || sp.producto_id} — S/ {sp.costo_unitario.toFixed(2)}</span>
                      <Button variant="ghost" size="icon" onClick={() => removeProduct(sp.producto_id)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
                <div className="pt-2 border-t text-sm font-semibold text-right">
                  Total: S/ {total.toFixed(2)}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Creando…" : "Crear Orden"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
