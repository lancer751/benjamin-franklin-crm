import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  FileText,
  Pencil,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/core/components/ui/alert-dialog";
import { Button } from "@/core/components/ui/button";
import { Skeleton } from "@/core/components/ui/skeleton";
import { useAuthStore } from "@/store/useAuthStore";
import { PaymentEditDialog } from "../components/PaymentEditDialog";
import { PaymentStatusDialog } from "../components/PaymentStatusDialog";
import {
  PaymentStatusBadge,
} from "../components/paymentDisplay";
import { useDeletePayment, usePayment } from "../hooks/usePayments";
import type { PaymentDetail } from "../types";
import {
  formatPaymentDate,
  formatPaymentMoney,
} from "../utils/paymentFormat";
import {
  getPaymentPermissions,
  paymentMethodLabels,
  paymentTypeLabels,
} from "../utils/paymentLogic";

export default function PaymentDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role.name);
  const permissions = getPaymentPermissions(role);
  const query = usePayment(id);
  const [showEdit, setShowEdit] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const deleteMutation = useDeletePayment(query.data);

  if (query.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <h1 className="text-lg font-semibold">El pago no existe.</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Puede haber sido eliminado o no estar disponible.
        </p>
        <Button className="mt-5" variant="outline" onClick={() => navigate("/pagos")}>
          Volver a pagos
        </Button>
      </div>
    );
  }

  const payment = query.data;
  const canChangeStatus =
    permissions.canChangeStatus && payment.status === "CONFIRMED";
  const canDelete =
    permissions.canDelete && payment.status !== "CONFIRMED";

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Volver a pagos"
            onClick={() => navigate("/pagos")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {payment.transactionId ?? "Pago sin identificador"}
              </h1>
              <PaymentStatusBadge status={payment.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatPaymentDate(payment.paymentDate, true)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {permissions.canEdit && (
            <Button variant="outline" onClick={() => setShowEdit(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar referencia
            </Button>
          )}
          {canChangeStatus && (
            <Button variant="outline" onClick={() => setShowStatus(true)}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Cambiar estado
            </Button>
          )}
          {permissions.canDelete && (
            <Button
              variant="destructive"
              disabled={!canDelete}
              title={
                canDelete
                  ? undefined
                  : "Los pagos confirmados deben reembolsarse."
              }
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
      </header>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Monto registrado</p>
        <p className="mt-1 text-3xl font-bold">
          {formatPaymentMoney(payment.amount, payment.currency)}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {paymentMethodLabels[payment.method]} ·{" "}
          {paymentTypeLabels[payment.type]}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailCard icon={CreditCard} title="Datos del pago">
          <DetailRow label="Transacción" value={payment.transactionId ?? "Sin identificador"} />
          <DetailRow label="Método" value={paymentMethodLabels[payment.method]} />
          <DetailRow label="Tipo" value={paymentTypeLabels[payment.type]} />
          <DetailRow label="Moneda" value={payment.currency} />
          <DetailRow label="Fecha" value={formatPaymentDate(payment.paymentDate, true)} />
        </DetailCard>

        <DetailCard icon={FileText} title="Orden asociada">
          <DetailRow
            label="Código"
            value={payment.orderCode ?? "Código no disponible"}
          />
          <DetailRow
            label="Total de la orden"
            value={formatPaymentMoney(payment.orderTotal)}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/ordenes/${payment.orderId}`)}
          >
            Ver detalle de la orden
          </Button>
        </DetailCard>

        <DetailCard icon={User} title="Cliente">
          <DetailRow label="Nombre" value={payment.client.fullName} />
          {payment.client.email && (
            <DetailRow label="Correo" value={payment.client.email} />
          )}
          {payment.client.dni && (
            <DetailRow label="DNI" value={payment.client.dni} />
          )}
        </DetailCard>

        <DetailCard icon={CalendarDays} title="Cuota asociada">
          {payment.scheduledPayment ? (
            <>
              <DetailRow
                label="Número"
                value={`Cuota ${payment.scheduledPayment.number}`}
              />
              <DetailRow
                label="Vencimiento"
                value={formatPaymentDate(payment.scheduledPayment.due_date)}
              />
              <DetailRow
                label="Monto"
                value={formatPaymentMoney(payment.scheduledPayment.due_amount)}
              />
              <DetailRow
                label="Estado"
                value={payment.scheduledPayment.status}
              />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Este pago no está asociado a una cuota.
            </p>
          )}
        </DetailCard>
      </div>

      {payment.paymentPlans.length > 0 && (
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="font-semibold">Plan de pagos de la orden</h2>
          <div className="mt-4 space-y-4">
            {payment.paymentPlans.map((plan) => (
              <div key={plan.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {plan.total_installments} cuotas ·{" "}
                    {formatPaymentMoney(plan.total_amount)}
                  </p>
                  <span className="text-sm text-muted-foreground">
                    {plan.status}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {(plan.installments ?? []).map((installment) => (
                    <div key={installment.id} className="rounded-md bg-muted/50 p-3 text-sm">
                      <p className="font-medium">Cuota {installment.number}</p>
                      <p className="text-muted-foreground">
                        {formatPaymentDate(installment.due_date)} ·{" "}
                        {formatPaymentMoney(installment.due_amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {installment.status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <DetailCard icon={CalendarDays} title="Auditoría">
        <DetailRow label="Creado" value={formatPaymentDate(payment.createdAt, true)} />
        <DetailRow label="Actualizado" value={formatPaymentDate(payment.updatedAt, true)} />
      </DetailCard>

      <PaymentEditDialog
        payment={showEdit ? payment : null}
        onClose={() => setShowEdit(false)}
      />
      <PaymentStatusDialog
        payment={showStatus ? payment : null}
        onClose={() => setShowStatus(false)}
      />
      <DeleteDialog
        open={showDelete}
        payment={payment}
        isPending={deleteMutation.isPending}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}

function DetailCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof CreditCard;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function DeleteDialog({
  open,
  payment,
  isPending,
  onClose,
  onConfirm,
}: {
  open: boolean;
  payment: PaymentDetail;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={(value) => !value && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eliminar pago</AlertDialogTitle>
          <AlertDialogDescription>
            Se eliminará{" "}
            {payment.transactionId ?? "el pago sin identificador"}. Esta acción
            no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending || payment.status === "CONFIRMED"}
          >
            {isPending ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
