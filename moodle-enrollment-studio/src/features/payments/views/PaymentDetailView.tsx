import { useState } from "react";
import { ArrowLeft, CheckCircle2, ExternalLink, FileText, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/core/components/ui/button";
import { Skeleton } from "@/core/components/ui/skeleton";
import { useAuthStore } from "@/store/useAuthStore";
import { PaymentStatusDialog } from "../components/PaymentStatusDialog";
import { PaymentStatusBadge } from "../components/paymentDisplay";
import { getPaymentPermissions, usePayment, usePaymentReceipt } from "../hooks/usePayments";
import type { PaymentReviewStatus } from "../types";
import { formatPaymentDate, formatPaymentMoney } from "../utils/paymentFormat";
import { paymentMethodLabels } from "../utils/paymentLogic";

export default function PaymentDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role.name);
  const permissions = getPaymentPermissions(role);
  const query = usePayment(id);
  const receipt = usePaymentReceipt(id);
  const [action, setAction] = useState<PaymentReviewStatus | null>(null);

  if (query.isLoading) return <div className="space-y-5"><Skeleton className="h-12 w-72" /><Skeleton className="h-80 rounded-xl" /></div>;
  if (query.isError || !query.data) return <div className="rounded-xl border p-10 text-center"><p className="font-semibold">El pago no existe.</p><Button className="mt-4" onClick={() => navigate("/pagos")}>Volver</Button></div>;

  const payment = query.data;
  const openReceipt = async () => {
    const result = await receipt.refetch();
    if (result.data) window.open(result.data, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/pagos")}><ArrowLeft className="h-5 w-5" /></Button>
          <div><div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-bold">Pago</h1><PaymentStatusBadge status={payment.status} /></div><p className="text-sm text-muted-foreground">{payment.orderCode ?? "Orden sin código"}</p></div>
        </div>
        {permissions.canReview && payment.status === "PENDING" && <div className="flex gap-2"><Button variant="destructive" onClick={() => setAction("FAILED")}><XCircle className="mr-2 h-4 w-4" />Rechazar</Button><Button onClick={() => setAction("CONFIRMED")}><CheckCircle2 className="mr-2 h-4 w-4" />Confirmar pago</Button></div>}
      </header>

      <section className="rounded-xl border bg-card p-5"><p className="text-sm text-muted-foreground">Monto</p><p className="text-3xl font-bold">{formatPaymentMoney(payment.amount, payment.currency)}</p></section>

      <div className="grid gap-5 md:grid-cols-2">
        <Info title="Contexto">
          <Row label="Prospecto" value={payment.clientName} />
          <Row label="Orden" value={payment.orderCode ?? "No disponible"} />
          <Row label="Producto" value={payment.productName} />
          <Row label="Obligación" value={payment.installmentLabel ?? "Pago completo"} />
        </Info>
        <Info title="Datos del pago">
          <Row label="Fecha" value={formatPaymentDate(payment.paymentDate, true)} />
          <Row label="Método" value={paymentMethodLabels[payment.method]} />
          <Row label="Transacción" value={payment.transactionId ?? "No registrada"} />
          <Row label="Moneda" value={payment.currency} />
        </Info>
        <Info title="Auditoría">
          <Row label="Registrado por" value={payment.registeredBy} />
          <Row label="Revisado por" value={payment.reviewedBy ?? "Aún no revisado"} />
          <Row label="Creado" value={formatPaymentDate(payment.createdAt, true)} />
        </Info>
        <Info title="Comprobante">
          <p className="text-sm text-muted-foreground">El archivo se obtiene mediante una URL temporal y segura.</p>
          <Button className="mt-4" variant="outline" disabled={receipt.isFetching} onClick={openReceipt}><FileText className="mr-2 h-4 w-4" />{receipt.isFetching ? "Abriendo..." : "Ver comprobante"}<ExternalLink className="ml-2 h-3.5 w-3.5" /></Button>
        </Info>
      </div>
      <PaymentStatusDialog payment={payment} action={action} onClose={() => setAction(null)} />
    </div>
  );
}

function Info({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-xl border bg-card p-5"><h2 className="mb-4 font-semibold">{title}</h2><div className="space-y-3">{children}</div></section>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 text-sm"><span className="text-muted-foreground">{label}</span><span className="text-right font-medium">{value}</span></div>;
}
