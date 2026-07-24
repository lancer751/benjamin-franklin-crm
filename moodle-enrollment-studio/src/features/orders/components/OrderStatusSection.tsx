import { AlertTriangle } from "lucide-react";
import { useController, type Control } from "react-hook-form";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Label } from "@/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import type { OrderFormValues, OrderStatus } from "../types";

const labels: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  REFUNDED: "Reembolsada",
};

export function OrderStatusSection({
  control,
}: {
  control: Control<OrderFormValues>;
}) {
  const { field, fieldState } = useController({
    control,
    name: "order_status",
  });

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Estado</h2>
        <p className="text-sm text-muted-foreground">
          Actualiza la situación administrativa de la orden.
        </p>
      </div>
      <div className="max-w-sm space-y-2">
        <Label htmlFor="order-status">Estado de la orden</Label>
        <Select
          value={field.value}
          onValueChange={(value) => field.onChange(value as OrderStatus)}
        >
          <SelectTrigger id="order-status">
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(labels) as OrderStatus[]).map((status) => (
              <SelectItem key={status} value={status}>
                {labels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fieldState.error && (
          <p className="text-sm font-medium text-destructive">
            {fieldState.error.message}
          </p>
        )}
      </div>
      {field.value === "COMPLETED" && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Solo se podrá completar la orden si los pagos confirmados cubren el
            importe total.
          </AlertDescription>
        </Alert>
      )}
    </section>
  );
}
