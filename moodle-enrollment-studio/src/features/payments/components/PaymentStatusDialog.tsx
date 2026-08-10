import { Button } from "@/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { useReviewPayment } from "../hooks/usePayments";
import type { PaymentListItem, PaymentReviewStatus } from "../types";

interface Props {
  payment: PaymentListItem | null;
  action: PaymentReviewStatus | null;
  onClose: () => void;
}

export function PaymentStatusDialog({ payment, action, onClose }: Props) {
  const mutation = useReviewPayment(payment ?? undefined);
  const confirming = action === "CONFIRMED";
  return (
    <Dialog open={Boolean(payment && action)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{confirming ? "Confirmar pago" : "Rechazar pago"}</DialogTitle>
          <DialogDescription>
            {confirming
              ? "Al confirmar, el pago se aplicará al cronograma y a la orden cuando corresponda."
              : "La obligación quedará disponible para registrar un nuevo comprobante."}
          </DialogDescription>
        </DialogHeader>
        <p className="rounded-lg bg-muted/50 p-3 text-sm">
          {payment?.clientName} · {payment?.orderCode ?? "Orden sin código"}
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button
            variant={confirming ? "default" : "destructive"}
            disabled={mutation.isPending || payment?.status !== "PENDING" || !action}
            onClick={() => action && mutation.mutate({ payment_status: action }, { onSuccess: onClose })}
          >
            {mutation.isPending ? "Procesando..." : confirming ? "Confirmar pago" : "Rechazar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
