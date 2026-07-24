import { useEffect, useState } from "react";
import { Button } from "@/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { Label } from "@/core/components/ui/label";
import { useUpdatePaymentStatus } from "../hooks/usePayments";
import type { PaymentListItem, PaymentStatus } from "../types";
import { paymentStatusLabels } from "../utils/paymentLogic";

interface Props {
  payment: PaymentListItem | null;
  onClose: () => void;
}

export function PaymentStatusDialog({ payment, onClose }: Props) {
  const [status, setStatus] = useState<PaymentStatus>("REFUNDED");
  const mutation = useUpdatePaymentStatus(payment ?? undefined);

  useEffect(() => {
    if (!payment) return;
    setStatus(payment.status === "CONFIRMED" ? "REFUNDED" : "CONFIRMED");
  }, [payment]);

  const locked =
    payment?.status === "REFUNDED" || payment?.status === "FAILED";

  return (
    <Dialog open={Boolean(payment)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar estado</DialogTitle>
          <DialogDescription>
            Esta acción puede actualizar también la cuota asociada.
          </DialogDescription>
        </DialogHeader>
        {locked ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            No se puede cambiar el estado de un pago{" "}
            {payment?.status === "FAILED" ? "fallido" : "reembolsado"}.
          </p>
        ) : (
          <div className="grid gap-2 py-2">
            <Label htmlFor="payment-status">Nuevo estado</Label>
            <select
              id="payment-status"
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as PaymentStatus)
              }
            >
              {(["CONFIRMED", "REFUNDED", "FAILED"] as PaymentStatus[])
                .filter((value) => value !== payment?.status)
                .map((value) => (
                  <option key={value} value={value}>
                    {paymentStatusLabels[value]}
                  </option>
                ))}
            </select>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {!locked && (
            <Button
              onClick={() =>
                mutation.mutate(
                  { payment_status: status },
                  { onSuccess: onClose },
                )
              }
              disabled={mutation.isPending || status === payment?.status}
            >
              {mutation.isPending ? "Actualizando..." : "Confirmar cambio"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
