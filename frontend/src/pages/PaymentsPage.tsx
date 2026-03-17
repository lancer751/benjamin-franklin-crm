import { useState } from "react";
import { paymentsApi } from "@/api/payments";
import { useFetch } from "@/hooks/useFetch";
import type { ManualPaymentData } from "@/types/payment";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Plus } from "lucide-react";
import { toast } from "sonner";

const statusColor: Record<string, string> = {
  confirmado: "bg-success text-success-foreground",
  pendiente: "bg-warning text-warning-foreground",
  rechazado: "bg-destructive text-destructive-foreground",
  reembolsado: "bg-muted text-muted-foreground",
};

const methods = ["efectivo", "transferencia", "pos", "online", "yape"] as const;
const statuses = ["confirmado", "pendiente", "rechazado"] as const;

export default function PaymentsPage() {
  const { data: payments, loading, refetch } = useFetch(() => paymentsApi.getAll(), []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<ManualPaymentData>({
    order_id: "",
    amount: 0,
    method: "efectivo",
    paymentStatus: "pendiente",
  });
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.order_id || !form.amount) {
      toast.error("Complete todos los campos");
      return;
    }
    setSaving(true);
    try {
      await paymentsApi.createManual(form);
      toast.success("Pago registrado");
      setDialogOpen(false);
      refetch();
    } catch (err: unknown) {
      let message = "Error al registrar pago";

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
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-foreground">Pagos</h1>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Registrar Pago
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
                    <TableHead>ID</TableHead>
                    <TableHead>Orden</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Transacción</TableHead>
                    <TableHead>Fecha Pago</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(payments || []).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.id.slice(0, 8)}…</TableCell>
                      <TableCell className="font-mono text-xs">{p.orden_id.slice(0, 8)}…</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{p.metodo_pago}</Badge>
                      </TableCell>
                      <TableCell>
                        S/ {Number(p.cantidad).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColor[p.estado] || ""}>{p.estado}</Badge>
                      </TableCell>
                      <TableCell className="text-xs">{p.codigo_transaccion || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString("es-PE") : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(payments || []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No hay pagos.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Register Manual Payment */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago Manual</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label>ID de Orden</Label>
              <Input
                placeholder="UUID de la orden"
                value={form.order_id}
                onChange={(e) => setForm({ ...form, order_id: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Monto</Label>
              <Input
                type="number"
                value={form.amount || ""}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Método de Pago</Label>
              <Select
                value={form.method}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onValueChange={(v) => setForm({ ...form, method: v as any })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {methods.map((m) => (
                    <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Estado</Label>
              <Select
                value={form.paymentStatus}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onValueChange={(v) => setForm({ ...form, paymentStatus: v as any })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Registrando…" : "Registrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
