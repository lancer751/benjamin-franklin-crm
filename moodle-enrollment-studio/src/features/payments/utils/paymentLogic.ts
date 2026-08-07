import type { PaymentListItem, PaymentMethod, PaymentStatus, PaymentType } from "../types";

export type PaymentFilter = "ALL" | PaymentStatus;
export type PaymentMethodFilter = "ALL" | PaymentMethod;
export type PaymentTypeFilter = "ALL" | PaymentType;

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  YAPE: "Yape",
  ONLINE: "Pago en línea",
  POS: "POS",
  CASH: "Efectivo",
  BANK_TRANSFER: "Transferencia bancaria",
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  FAILED: "Rechazado",
  REFUNDED: "Reembolsado",
};

export const paymentTypeLabels: Record<PaymentType, string> = {
  FULL: "Pago completo",
  INSTALLMENTS: "Pago en cuotas",
};

export function normalizePaymentSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function filterPayments(
  payments: PaymentListItem[],
  search: string,
  status: PaymentFilter,
  method: PaymentMethodFilter,
  type: PaymentTypeFilter,
): PaymentListItem[] {
  const query = normalizePaymentSearch(search);
  return payments.filter((payment) => {
    if (status !== "ALL" && payment.status !== status) return false;
    if (method !== "ALL" && payment.method !== method) return false;
    if (type !== "ALL" && payment.type !== type) return false;
    if (!query) return true;
    return normalizePaymentSearch([
      payment.transactionId,
      payment.orderCode,
      payment.clientName,
      payment.productName,
      payment.registeredBy,
      paymentMethodLabels[payment.method],
    ].filter(Boolean).join(" ")).includes(query);
  });
}

export function calculatePaymentMetrics(payments: PaymentListItem[]) {
  return payments.reduce((metrics, payment) => {
    metrics.total += 1;
    if (payment.status === "CONFIRMED") {
      metrics.confirmed += 1;
      metrics.confirmedAmount += Number(payment.amount) || 0;
    }
    if (payment.status === "FAILED") metrics.failed += 1;
    return metrics;
  }, { total: 0, confirmed: 0, failed: 0, confirmedAmount: 0 });
}
