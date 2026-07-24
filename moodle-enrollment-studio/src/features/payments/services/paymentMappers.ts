import type { OrderResponse } from "@/features/orders/types";
import type {
  CreatePaymentPayload,
  PaymentDetail,
  PaymentEditFormValues,
  PaymentFormValues,
  PaymentListItem,
  PaymentOrderOption,
  PaymentResponse,
  UpdatePaymentPayload,
} from "../types";

export function moneyString(value: string | number): string {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : "0.00";
}

function fullName(person?: {
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
} | null): string {
  return [person?.first_name, person?.middle_name, person?.last_name]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapPaymentResponseToListItem(
  payment: PaymentResponse,
): PaymentListItem {
  return {
    id: payment.id,
    transactionId: payment.transaccion_id?.trim() || null,
    orderId: payment.order_id,
    orderCode: payment.order?.order_code?.trim() || null,
    orderTotal: moneyString(payment.order?.total_amount ?? 0),
    client: {
      fullName: fullName(payment.order?.lead) || "Prospecto sin nombre",
      email: payment.order?.lead?.email ?? null,
      dni: payment.order?.lead?.dni ?? null,
    },
    method: payment.payment_method,
    status: payment.payment_status,
    type: payment.type,
    amount: moneyString(payment.amount),
    currency: payment.currency,
    paymentDate: payment.payment_date,
    createdAt: payment.created_at,
  };
}

export function mapPaymentResponseToDetail(
  payment: PaymentResponse,
): PaymentDetail {
  return {
    ...mapPaymentResponseToListItem(payment),
    updatedAt: payment.updated_at,
    scheduledPayment: payment.schedulePayment ?? null,
    paymentPlans: payment.order?.paymentPlans ?? [],
  };
}

export function mapOrderResponseToPaymentOption(
  order: OrderResponse,
): PaymentOrderOption {
  const confirmedPaid = (order.payments ?? [])
    .filter((payment) => payment.payment_status === "CONFIRMED")
    .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
  const total = Number(order.total_amount) || 0;
  return {
    id: order.id,
    code: order.order_code,
    status: order.order_status,
    totalAmount: moneyString(order.total_amount),
    confirmedPaid,
    remainingBalance: Math.max(total - confirmedPaid, 0),
    clientName: fullName(order.lead) || "Prospecto sin nombre",
    clientEmail: order.lead.email ?? null,
  };
}

function toIso(value: string): string {
  return new Date(value).toISOString();
}

export function mapPaymentFormToCreatePayload(
  values: PaymentFormValues,
): CreatePaymentPayload {
  const payload: CreatePaymentPayload = {
    order_id: values.orderId,
    payment_date: toIso(values.paymentDate),
    amount: moneyString(values.amount),
    payment_method: values.paymentMethod,
    payment_status: values.paymentStatus,
    type: values.type,
    currency: values.currency.trim().toUpperCase(),
    transaccion_id: values.transactionId.trim() || null,
  };

  if (values.type === "INSTALLMENTS") {
    payload.payment_plan = {
      order_id: values.orderId,
      total_installments: Number(values.paymentPlan.totalInstallments),
      total_amount: moneyString(values.paymentPlan.totalAmount),
      start_date: toIso(values.paymentPlan.startDate),
      scheduled_payments: values.paymentPlan.scheduledPayments.map(
        (installment, index) => ({
          due_date: toIso(installment.dueDate),
          due_amount: moneyString(installment.dueAmount),
          number: index + 1,
        }),
      ),
    };
  }
  return payload;
}

export function mapPaymentToEditForm(
  payment: Pick<
    PaymentDetail,
    "paymentDate" | "transactionId" | "currency"
  >,
): PaymentEditFormValues {
  return {
    paymentDate: payment.paymentDate.slice(0, 16),
    transactionId: payment.transactionId ?? "",
    currency: payment.currency,
  };
}

export function mapEditFormToPayload(
  values: PaymentEditFormValues,
  initial: PaymentEditFormValues,
): UpdatePaymentPayload {
  const payload: UpdatePaymentPayload = {};
  if (values.paymentDate !== initial.paymentDate) {
    payload.payment_date = toIso(values.paymentDate);
  }
  if (values.transactionId !== initial.transactionId) {
    payload.transaccion_id = values.transactionId.trim() || null;
  }
  if (values.currency !== initial.currency) {
    payload.currency = values.currency.trim().toUpperCase();
  }
  return payload;
}

export function generateInstallments(
  totalAmount: string,
  countValue: string,
  startDate: string,
) {
  const count = Math.max(1, Math.trunc(Number(countValue) || 1));
  const totalCents = Math.round((Number(totalAmount) || 0) * 100);
  const baseCents = Math.round(totalCents / count);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(`${startDate}T00:00:00`);
    date.setMonth(date.getMonth() + index);
    const cents =
      index === count - 1
        ? totalCents - baseCents * (count - 1)
        : baseCents;
    return {
      number: index + 1,
      dueDate: date.toISOString().slice(0, 10),
      dueAmount: (cents / 100).toFixed(2),
    };
  });
}
