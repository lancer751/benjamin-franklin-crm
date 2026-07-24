import { useEffect, useMemo, useState } from "react";
import { Button } from "@/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { useUpdatePayment } from "../hooks/usePayments";
import {
  mapEditFormToPayload,
  mapPaymentToEditForm,
} from "../services/paymentMappers";
import type { PaymentListItem } from "../types";

interface Props {
  payment: PaymentListItem | null;
  onClose: () => void;
}

export function PaymentEditDialog({ payment, onClose }: Props) {
  const initial = useMemo(
    () => (payment ? mapPaymentToEditForm(payment) : null),
    [payment],
  );
  const [paymentDate, setPaymentDate] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [currency, setCurrency] = useState("PEN");
  const mutation = useUpdatePayment(payment ?? undefined);

  useEffect(() => {
    if (!initial) return;
    setPaymentDate(initial.paymentDate);
    setTransactionId(initial.transactionId);
    setCurrency(initial.currency);
  }, [initial]);

  const save = () => {
    if (!initial) return;
    const payload = mapEditFormToPayload(
      { paymentDate, transactionId, currency },
      initial,
    );
    if (Object.keys(payload).length === 0) {
      onClose();
      return;
    }
    mutation.mutate(payload, { onSuccess: onClose });
  };

  return (
    <Dialog open={Boolean(payment)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar referencia del pago</DialogTitle>
          <DialogDescription>
            Solo se pueden modificar la fecha, la transacción y la moneda.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="edit-payment-date">Fecha de pago</Label>
            <Input
              id="edit-payment-date"
              type="datetime-local"
              value={paymentDate}
              onChange={(event) => setPaymentDate(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-transaction">Número de operación</Label>
            <Input
              id="edit-transaction"
              value={transactionId}
              onChange={(event) => setTransactionId(event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-currency">Moneda</Label>
            <Input
              id="edit-currency"
              maxLength={3}
              value={currency}
              onChange={(event) => setCurrency(event.target.value.toUpperCase())}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={save}
            disabled={
              mutation.isPending ||
              !paymentDate ||
              currency.trim().length !== 3
            }
          >
            {mutation.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
