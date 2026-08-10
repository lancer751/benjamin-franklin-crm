import type { PaymentDetail, PaymentListItem, PaymentResponse } from "../types";
import { scheduledObligationLabel } from "../utils/paymentSchedulePresentation";

export function moneyString(value: string | number): string {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed.toFixed(2) : "0.00";
}

export function personName(person?: {
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
} | null): string {
  return [person?.first_name, person?.middle_name, person?.last_name]
    .filter((part): part is string => typeof part === "string" && Boolean(part.trim()))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function getPaymentLead(payment: PaymentResponse) {
  return payment.order?.member?.lead ?? null;
}

function getPaymentOrderDetail(payment: PaymentResponse) {
  return payment.orderDetail
    ?? payment.schedulePayment?.payment_plan?.orderDetail
    ?? null;
}

function getPaymentCreator(payment: PaymentResponse) {
  return payment.creator ?? null;
}

function getPaymentReviewer(payment: PaymentResponse) {
  return payment.reviewer ?? null;
}

export function mapPaymentResponseToListItem(payment: PaymentResponse): PaymentListItem {
  const lead = getPaymentLead(payment);
  const orderDetail = getPaymentOrderDetail(payment);
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
      : payment.type === "FULL" ? "Pago al contado" : null,
    method: payment.payment_method,
    status: payment.payment_status,
    type: payment.type,
    amount: moneyString(payment.amount),
    currency: payment.currency?.trim() || "PEN",
    paymentDate: payment.payment_date,
    createdAt: payment.created_at,
    registeredBy: personName(getPaymentCreator(payment)) || "Usuario no disponible",
    reviewedBy: personName(getPaymentReviewer(payment)) || null,
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
