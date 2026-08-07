import { describe, expect, it } from "vitest";
import type { PaymentListItem } from "../types";
import { calculatePaymentMetrics, filterPayments, paymentStatusLabels } from "./paymentLogic";

const payment: PaymentListItem = {
  id: "payment-1", transactionId: "YAPE-123", orderId: "order-1", orderCode: "REFTGEL",
  orderDetailId: "detail-1", scheduledPaymentId: null, clientName: "María Gaitán",
  productName: "Lectura de planos", installmentLabel: null, method: "YAPE", status: "CONFIRMED",
  type: "FULL", amount: "100.00", currency: "PEN", paymentDate: "2026-07-24", createdAt: "2026-07-24",
  registeredBy: "Ana Romero", reviewedBy: "Luis Vega",
};

describe("payment list logic", () => {
  it("busca por prospecto, orden, producto y registrador", () => {
    for (const query of ["REFTGEL", "planos", "Ana Romero"]) {
      expect(filterPayments([payment], query, "ALL", "ALL", "ALL")).toHaveLength(1);
    }
  });

  it("solo suma pagos confirmados", () => {
    expect(calculatePaymentMetrics([payment, { ...payment, id: "pending", status: "PENDING", amount: "500" }]).confirmedAmount).toBe(100);
  });

  it("traduce todos los estados", () => {
    expect(paymentStatusLabels).toEqual({ PENDING: "Pendiente", CONFIRMED: "Confirmado", FAILED: "Rechazado", REFUNDED: "Reembolsado" });
  });
});
