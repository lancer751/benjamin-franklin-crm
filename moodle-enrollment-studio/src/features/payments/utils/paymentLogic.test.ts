import { describe, expect, it } from "vitest";
import type { PaymentFormValues, PaymentListItem } from "../types";
import {
  calculatePaymentMetrics,
  filterPayments,
  getPaymentPermissions,
  validatePaymentForm,
} from "./paymentLogic";

const basePayment: PaymentListItem = {
  id: "payment-1",
  transactionId: "YAPE-123",
  orderId: "order-1",
  orderCode: "REFTGEL",
  orderTotal: "440.00",
  client: {
    fullName: "María Gaitán",
    email: "maria@example.com",
    dni: null,
  },
  method: "YAPE",
  status: "CONFIRMED",
  type: "FULL",
  amount: "100.00",
  currency: "PEN",
  paymentDate: "2026-07-24T10:00:00.000Z",
  createdAt: "2026-07-24T10:00:00.000Z",
};

const validInstallmentForm: PaymentFormValues = {
  orderId: "order-1",
  paymentDate: "2026-07-24T10:00",
  amount: "150.00",
  paymentMethod: "YAPE",
  paymentStatus: "CONFIRMED",
  type: "INSTALLMENTS",
  currency: "PEN",
  transactionId: "",
  paymentPlan: {
    totalInstallments: "2",
    totalAmount: "300.00",
    startDate: "2026-07-24",
    scheduledPayments: [
      { number: 1, dueDate: "2026-07-24", dueAmount: "150.00" },
      { number: 2, dueDate: "2026-08-24", dueAmount: "150.00" },
    ],
  },
};

describe("payment list logic", () => {
  it("busca por transacción, orden, cliente, email y método sin tildes", () => {
    for (const query of [
      "YAPE-123",
      "REFTGEL",
      "Maria Gaitan",
      "maria@example.com",
      "Yape",
    ]) {
      expect(
        filterPayments([basePayment], query, "ALL", "ALL", "ALL"),
      ).toHaveLength(1);
    }
  });

  it("combina filtros de estado, método y tipo", () => {
    expect(
      filterPayments(
        [basePayment],
        "",
        "CONFIRMED",
        "YAPE",
        "FULL",
      ),
    ).toHaveLength(1);
    expect(
      filterPayments([basePayment], "", "FAILED", "ALL", "ALL"),
    ).toHaveLength(0);
  });

  it("monto confirmado excluye FAILED y REFUNDED", () => {
    const metrics = calculatePaymentMetrics([
      basePayment,
      { ...basePayment, id: "failed", status: "FAILED", amount: "500.00" },
      {
        ...basePayment,
        id: "refunded",
        status: "REFUNDED",
        amount: "300.00",
      },
    ]);
    expect(metrics).toEqual({
      total: 3,
      confirmed: 1,
      failed: 1,
      confirmedAmount: 100,
    });
  });

  it("controla acceso y acciones por rol", () => {
    expect(getPaymentPermissions("SALES_REP")).toMatchObject({
      canAccess: true,
      canCreate: true,
      canChangeStatus: false,
      canDelete: false,
    });
    expect(getPaymentPermissions("SALES_SUPERVISOR").canDelete).toBe(true);
    expect(getPaymentPermissions("ADMIN").canChangeStatus).toBe(true);
    expect(getPaymentPermissions("MARKETING").canAccess).toBe(false);
  });

  it("valida plan, primera cuota y sobrepago confirmado", () => {
    expect(validatePaymentForm(validInstallmentForm, 300)).toEqual([]);
    expect(
      validatePaymentForm(
        { ...validInstallmentForm, amount: "151.00" },
        300,
      ),
    ).toContain("El pago inicial debe coincidir con la primera cuota.");
    expect(
      validatePaymentForm(
        { ...validInstallmentForm, amount: "301.00", type: "FULL" },
        300,
      ),
    ).toContain("El pago confirmado supera el saldo pendiente de la orden.");
  });

  it("FAILED y REFUNDED no son bloqueados por saldo en frontend", () => {
    const failed = {
      ...validInstallmentForm,
      type: "FULL" as const,
      paymentStatus: "FAILED" as const,
      amount: "999.00",
    };
    expect(validatePaymentForm(failed, 300)).not.toContain(
      "El pago confirmado supera el saldo pendiente de la orden.",
    );
  });
});
