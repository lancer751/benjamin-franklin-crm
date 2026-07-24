import type {
  OrderPayment,
  OrderResponse,
  OrderStatus,
} from "../../types";

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  REFUNDED: "Reembolsada",
};

export const orderStatusStyles: Record<OrderStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-700",
  REFUNDED: "border-blue-200 bg-blue-50 text-blue-700",
};

export const paymentMethodLabels: Record<string, string> = {
  CASH: "Efectivo",
  BANK_TRANSFER: "Transferencia bancaria",
  POS: "POS",
  ONLINE: "Pago en línea",
  YAPE: "Yape",
};

export const paymentStatusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  FAILED: "Fallido",
  REFUNDED: "Reembolsado",
};

export const paymentTypeLabels: Record<string, string> = {
  FULL: "Pago completo",
  INSTALLMENTS: "Cuotas",
};

export const planStatusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};

export const installmentStatusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagada",
  OVERDUE: "Vencida",
};

export function formatOrderDate(value?: string, includeTime = false): string {
  if (!value) return "No registrada";
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
  }).format(new Date(value));
}

export function fullName(
  person?: {
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
  } | null,
): string {
  return [person?.first_name, person?.middle_name, person?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function confirmedPaymentsTotal(payments: OrderPayment[] = []): number {
  return payments
    .filter((payment) => payment.payment_status === "CONFIRMED")
    .reduce((total, payment) => total + (Number(payment.amount) || 0), 0);
}

export function orderBalance(order: OrderResponse): number {
  return Math.max(
    Number(order.total_amount) - confirmedPaymentsTotal(order.payments),
    0,
  );
}

export function canManageOrders(role?: string): boolean {
  return ["ADMIN", "SALES_REP", "SALES_SUPERVISOR"].includes(role ?? "");
}

export function canRegisterOrderPayment(
  order: OrderResponse,
  role?: string,
): boolean {
  return (
    canManageOrders(role) &&
    order.order_status === "PENDING" &&
    orderBalance(order) > 0
  );
}
