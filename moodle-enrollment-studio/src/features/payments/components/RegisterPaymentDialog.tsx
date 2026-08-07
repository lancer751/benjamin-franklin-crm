import { useEffect, useState } from "react";
import { FileUp } from "lucide-react";
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
import type { OrderDisplayItem, OrderInstallment, OrderResponse } from "@/features/orders/types";
import { useRegisterPayment, paymentMethods } from "../hooks/usePayments";
import type { PaymentMethod } from "../types";
import { formatPaymentDate, formatPaymentMoney } from "../utils/paymentFormat";
import { paymentMethodLabels } from "../utils/paymentLogic";
import { scheduledObligationLabel } from "../utils/paymentSchedulePresentation";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

interface Props {
  order: OrderResponse;
  item: OrderDisplayItem | null;
  installment?: OrderInstallment | null;
  open: boolean;
  onClose: () => void;
}

export function RegisterPaymentDialog({ order, item, installment = null, open, onClose }: Props) {
  const mutation = useRegisterPayment();
  const [method, setMethod] = useState<PaymentMethod>("YAPE");
  const [date, setDate] = useState("");
  const [currency, setCurrency] = useState("PEN");
  const [transactionId, setTransactionId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const amount = installment?.due_amount ?? item?.finalPrice ?? "0";
  const obligationLabel = installment
    ? scheduledObligationLabel(installment.number, item?.enrollmentFee ?? 0)
    : "Pago completo";

  useEffect(() => {
    if (!open) return;
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setDate(now.toISOString().slice(0, 16));
    setMethod("YAPE");
    setCurrency("PEN");
    setTransactionId("");
    setFile(null);
    setFileError(null);
  }, [open]);

  const submit = () => {
    if (!item || !file || !date) return;
    mutation.mutate({
      file,
      payload: {
        order_id: order.id,
        payment_date: new Date(date).toISOString(),
        amount: Number(amount).toFixed(2),
        payment_method: method,
        currency,
        ...(transactionId.trim() && { transaccion_id: transactionId.trim() }),
        target: installment?.id
          ? { type: "SCHEDULED_INSTALLMENT", scheduled_payment_id: installment.id }
          : { type: "FULL_CASH", order_detail_id: item.detailId },
      },
    }, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>Registrar pago</DialogTitle><DialogDescription>El pago quedará pendiente de validación.</DialogDescription></DialogHeader>
        <div className="rounded-lg bg-muted/50 p-4 text-sm">
          <p className="font-semibold">{order.leadName}</p>
          <p>{item?.productName}</p>
          {installment && <p>{obligationLabel} · vence {formatPaymentDate(installment.due_date)}</p>}
          <p className="text-xs text-muted-foreground">Orden {order.orderCode}</p>
          <p className="mt-2 text-lg font-bold">{formatPaymentMoney(amount, currency)}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Monto"><Input value={formatPaymentMoney(amount, currency)} readOnly /></Field>
          <Field label="Fecha de pago"><Input type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} /></Field>
          <Field label="Método"><select className="h-10 rounded-md border bg-background px-3 text-sm" value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>{paymentMethods.map((value) => <option key={value} value={value}>{paymentMethodLabels[value]}</option>)}</select></Field>
          <Field label="Moneda"><Input maxLength={3} value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} /></Field>
          <div className="sm:col-span-2"><Field label="ID de transacción (opcional)"><Input value={transactionId} onChange={(event) => setTransactionId(event.target.value)} /></Field></div>
          <div className="sm:col-span-2"><Field label="Comprobante"><Input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            if (selected && !ACCEPTED_TYPES.includes(selected.type)) { setFile(null); setFileError("Usa un archivo JPEG, PNG, WebP o PDF."); return; }
            setFile(selected); setFileError(null);
          }} />{fileError && <p className="text-xs text-destructive">{fileError}</p>}{file && <p className="text-xs text-muted-foreground">{file.name}</p>}</Field></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancelar</Button><Button disabled={!file || !date || currency.length !== 3 || mutation.isPending} onClick={submit}><FileUp className="mr-2 h-4 w-4" />{mutation.isPending ? "Subiendo comprobante..." : "Registrar pago"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}
