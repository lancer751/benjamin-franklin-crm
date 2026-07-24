import type {
  PaymentFormValues,
  PaymentListItem,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
} from "../types";

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
  CONFIRMED: "Confirmado",
  REFUNDED: "Reembolsado",
  FAILED: "Fallido",
};

export const paymentTypeLabels: Record<PaymentType, string> = {
  FULL: "Pago completo",
  INSTALLMENTS: "Pago en cuotas",
};

export function normalizePaymentSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
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
    return [
      payment.transactionId,
      payment.orderCode,
      payment.client.fullName,
      payment.client.email,
      paymentMethodLabels[payment.method],
    ]
      .filter((value): value is string => Boolean(value))
      .some((value) => normalizePaymentSearch(value).includes(query));
  });
}

export function calculatePaymentMetrics(payments: PaymentListItem[]) {
  return payments.reduce(
    (metrics, payment) => {
      metrics.total += 1;
      if (payment.status === "CONFIRMED") {
        metrics.confirmed += 1;
        metrics.confirmedAmount += Number(payment.amount) || 0;
      }
      if (payment.status === "FAILED") metrics.failed += 1;
      return metrics;
    },
    { total: 0, confirmed: 0, failed: 0, confirmedAmount: 0 },
  );
}

export function getPaymentPermissions(role?: string) {
  const canAccess =
    role === "ADMIN" ||
    role === "SALES_REP" ||
    role === "SALES_SUPERVISOR";
  const canManage = role === "ADMIN" || role === "SALES_SUPERVISOR";
  return {
    canAccess,
    canCreate: canAccess,
    canEdit: canAccess,
    canChangeStatus: canManage,
    canDelete: canManage,
  };
}

export function validatePaymentForm(
  values: PaymentFormValues,
  remainingBalance: number,
): string[] {
  const errors: string[] = [];
  const amount = Number(values.amount);
  if (!values.orderId) errors.push("Selecciona una orden.");
  if (!values.paymentDate || Number.isNaN(new Date(values.paymentDate).getTime())) {
    errors.push("Ingresa una fecha de pago válida.");
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    errors.push("El monto debe ser mayor que cero.");
  }
  if (values.currency.trim().length !== 3) {
    errors.push("La moneda debe tener exactamente 3 caracteres.");
  }
  if (values.paymentStatus === "CONFIRMED" && amount > remainingBalance) {
    errors.push("El pago confirmado supera el saldo pendiente de la orden.");
  }

  if (values.type === "INSTALLMENTS") {
    const plan = values.paymentPlan;
    const count = Number(plan.totalInstallments);
    const total = Number(plan.totalAmount);
    if (!Number.isInteger(count) || count <= 0) {
      errors.push("La cantidad de cuotas debe ser un entero positivo.");
    }
    if (plan.scheduledPayments.length !== count) {
      errors.push("La cantidad de cuotas no coincide con el plan.");
    }
    if (!Number.isFinite(total) || total <= 0 || total > remainingBalance) {
      errors.push("El total del plan debe ser positivo y no superar el saldo.");
    }
    if (
      plan.scheduledPayments.some(
        (installment) =>
          Number(installment.dueAmount) <= 0 ||
          Number.isNaN(new Date(installment.dueDate).getTime()),
      )
    ) {
      errors.push("Todas las cuotas deben tener fecha y monto válidos.");
    }
    const scheduledTotal = plan.scheduledPayments.reduce(
      (sum, installment) => sum + Math.round(Number(installment.dueAmount) * 100),
      0,
    );
    if (scheduledTotal !== Math.round(total * 100)) {
      errors.push("La suma de las cuotas debe coincidir con el total del plan.");
    }
    if (
      plan.scheduledPayments[0] &&
      Math.round(Number(plan.scheduledPayments[0].dueAmount) * 100) !==
        Math.round(amount * 100)
    ) {
      errors.push("El pago inicial debe coincidir con la primera cuota.");
    }
  }
  return errors;
}
