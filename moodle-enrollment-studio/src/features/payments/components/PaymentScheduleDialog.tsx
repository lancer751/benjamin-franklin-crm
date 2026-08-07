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
import type { OrderDisplayItem } from "@/features/orders/types";
import { useSavePaymentSchedule } from "../hooks/usePaymentPlan";
import { formatPaymentMoney } from "../utils/paymentFormat";
import {
  distributeScheduleAmounts,
  draftObligationLabel,
} from "../utils/paymentSchedulePresentation";

interface Entry { dueDate: string; amount: string }

function dateAtMonth(start: string, offset: number) {
  const date = new Date(`${start}T12:00:00`);
  date.setMonth(date.getMonth() + offset);
  return date.toISOString().slice(0, 10);
}

export function PaymentScheduleDialog({ orderId, item, open, onClose }: { orderId: string; item: OrderDisplayItem | null; open: boolean; onClose: () => void }) {
  const editing = Boolean(item?.paymentPlan);
  const [laterCount, setLaterCount] = useState(1);
  const [entries, setEntries] = useState<Entry[]>([]);
  const mutation = useSavePaymentSchedule(orderId, item?.detailId ?? "", editing);
  const total = Number(item?.finalPrice ?? 0);
  const enrollment = Number(item?.enrollmentFee ?? 0);
  const remaining = total - enrollment;

  useEffect(() => {
    if (!open || !item) return;
    if (item.paymentPlan) {
      setLaterCount(Math.max(item.paymentPlan.installments.length - (enrollment > 0 ? 1 : 0), 1));
      setEntries(item.paymentPlan.installments.map((entry) => ({ dueDate: entry.due_date.slice(0, 10), amount: Number(entry.due_amount).toFixed(2) })));
      return;
    }
    const count = item.paymentModality === "FULL" ? 1 : Math.max(item.installmentsMin, 1);
    setLaterCount(count);
    generate(count, new Date().toISOString().slice(0, 10), item);
  }, [open, item]);

  const generate = (count: number, start: string, target = item) => {
    if (!target) return;
    const fee = Number(target.enrollmentFee);
    const amounts = distributeScheduleAmounts(Number(target.finalPrice), fee, count);
    const next = amounts.map((amount, index): Entry => ({
      dueDate: dateAtMonth(start, index),
      amount,
    }));
    setEntries(next);
  };

  const sum = useMemo(() => entries.reduce((value, entry) => value + Math.round(Number(entry.amount) * 100), 0) / 100, [entries]);
  const valid = Math.round(sum * 100) === Math.round(total * 100) && entries.every((entry) => entry.dueDate && Number(entry.amount) > 0);

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar cronograma" : "Crear cronograma"}</DialogTitle>
          <DialogDescription>Define las fechas del cronograma. Los montos serán validados por el servidor.</DialogDescription>
        </DialogHeader>
        {item?.productName && <p className="text-sm font-medium">{item.productName}</p>}
        <div className="grid gap-3 rounded-lg bg-muted/50 p-4 sm:grid-cols-4">
          <Summary label="Total" value={formatPaymentMoney(total)} />
          <Summary label="Matrícula" value={formatPaymentMoney(enrollment)} />
          <Summary label="Saldo" value={formatPaymentMoney(remaining)} />
          <Summary label="Programado" value={formatPaymentMoney(sum)} />
        </div>
        <div className="grid max-w-xs gap-2">
          <Label>{enrollment > 0 ? "Cuotas posteriores" : "Cuotas"}</Label>
          <select className="h-10 rounded-md border bg-background px-3" value={laterCount} onChange={(event) => { const count = Number(event.target.value); setLaterCount(count); generate(count, entries[0]?.dueDate ?? new Date().toISOString().slice(0, 10)); }} disabled={item?.paymentModality === "FULL"}>{(item?.paymentModality === "FULL" ? [1] : Array.from({ length: Math.max((item?.installmentsMax ?? 1) - (item?.installmentsMin ?? 1) + 1, 1) }, (_, index) => (item?.installmentsMin ?? 1) + index)).map((count) => <option key={count} value={count}>{count}</option>)}</select>
        </div>
        <div className="space-y-2">{entries.map((entry, index) => <div key={index} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[100px_1fr_1fr] sm:items-center"><span className="font-medium">{draftObligationLabel(index, enrollment)}</span><Input type="date" value={entry.dueDate} onChange={(event) => setEntries((current) => current.map((value, currentIndex) => currentIndex === index ? { ...value, dueDate: event.target.value } : value))} /><span className="text-right font-semibold">{formatPaymentMoney(entry.amount)}</span></div>)}</div>
        {!valid && <p className="text-sm text-destructive">La suma programada debe coincidir con el total del producto.</p>}
        <DialogFooter><Button variant="outline" onClick={onClose}>Cancelar</Button><Button disabled={!valid || mutation.isPending || !entries[0]?.dueDate} onClick={() => item && entries[0] && mutation.mutate({ start_date: new Date(`${entries[0].dueDate}T12:00:00`).toISOString(), installments: entries.map((entry) => ({ due_date: new Date(`${entry.dueDate}T12:00:00`).toISOString(), due_amount: entry.amount })) }, { onSuccess: onClose })}>{mutation.isPending ? "Guardando..." : "Guardar cronograma"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Summary({ label, value }: { label: string; value: string }) { return <div><p className="text-xs text-muted-foreground">{label}</p><p className="font-semibold">{value}</p></div>; }
