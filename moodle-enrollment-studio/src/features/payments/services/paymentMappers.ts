import type { PaymentDetail, PaymentListItem, PaymentResponse } from "../types";
import { scheduledObligationLabel } from "../utils/paymentSchedulePresentation";

export function moneyString(value: string | number): string {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : "0.00";
}

export function personName(person?: { first_name?: string | null; last_name?: string | null } | null): string {
  return [person?.first_name, person?.last_name]
    .filter((part): part is string => typeof part === "string" && Boolean(part.trim()))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapPaymentResponseToListItem(payment: PaymentResponse): PaymentListItem {
  const lead = payment.order?.member?.lead;
  const orderDetail = payment.orderDetail
    ?? payment.schedulePayment?.payment_plan?.orderDetail;
  const enrollmentFee = orderDetail?.product?.enrollment_fee ?? 0;
  return {
    id: payment.id,
    transactionId: payment.transaccion_id?.trim() || null,
    orderId: payment.order_id,
    orderCode: payment.order?.order_code?.trim() || null,
    orderDetailId: payment.order_detail_id ?? payment.schedulePayment?.payment_plan?.orderDetail?.id ?? null,
    scheduledPaymentId: payment.scheduled_payment_id ?? null,
    clientName: personName(lead) || "Prospecto no disponible",
    productName: orderDetail?.product?.name || "Producto no disponible",
    installmentLabel: payment.schedulePayment
      ? scheduledObligationLabel(payment.schedulePayment.number, enrollmentFee)
      : null,
    method: payment.payment_method,
    status: payment.payment_status,
    type: payment.type,
    amount: moneyString(payment.amount),
    currency: payment.currency?.trim() || "PEN",
    paymentDate: payment.payment_date,
    createdAt: payment.created_at,
    registeredBy: personName(payment.creator) || "Usuario no disponible",
    reviewedBy: personName(payment.reviewer) || null,
  };
}

export function mapPaymentResponseToDetail(payment: PaymentResponse): PaymentDetail {
  return {
    ...mapPaymentResponseToListItem(payment),
    updatedAt: payment.updated_at,
    receiptKey: payment.payment_receipt,
    scheduledPayment: payment.schedulePayment ?? null,
  };
}
