import { describe, expect, it } from "vitest";
import type { PaymentFormValues, PaymentResponse } from "../types";
import {
  generateInstallments,
  mapEditFormToPayload,
  mapPaymentFormToCreatePayload,
  mapPaymentResponseToDetail,
  mapPaymentResponseToListItem,
} from "./paymentMappers";

const response: PaymentResponse = {
  id: "payment-1",
  order_id: "order-1",
  payment_date: "2026-07-24T15:30:00.000Z",
  amount: "440",
  payment_method: "YAPE",
  payment_status: "CONFIRMED",
  type: "FULL",
  currency: "PEN",
  transaccion_id: "YAPE-123",
  created_at: "2026-07-24T15:31:00.000Z",
  updated_at: "2026-07-24T15:31:00.000Z",
  order: {
    id: "order-1",
    order_code: "REFTGEL",
    total_amount: "440",
    lead: {
      first_name: "Rodrigo",
      middle_name: "",
      last_name: "Gaitán",
      email: "rodrigo@example.com",
      dni: "12345678",
    },
    paymentPlans: [],
  },
  schedulePayment: null,
};

function formValues(type: "FULL" | "INSTALLMENTS"): PaymentFormValues {
  return {
    orderId: "order-1",
    paymentDate: "2026-07-24T15:30",
    amount: type === "FULL" ? "440" : "146.67",
    paymentMethod: "YAPE",
    paymentStatus: "CONFIRMED",
    type,
    currency: "pen",
    transactionId: " YAPE-123 ",
    paymentPlan: {
      totalInstallments: "3",
      totalAmount: "440",
      startDate: "2026-07-24",
      scheduledPayments: generateInstallments("440", "3", "2026-07-24"),
    },
  };
}

describe("payment mappers", () => {
  it("crea un PaymentListItem seguro y legible", () => {
    const unsafeResponse = {
      ...response,
      password: "secret",
      role_id: "role-1",
    };
    const mapped = mapPaymentResponseToListItem(unsafeResponse);

    expect(mapped).toMatchObject({
      id: "payment-1",
      transactionId: "YAPE-123",
      orderCode: "REFTGEL",
      amount: "440.00",
      client: {
        fullName: "Rodrigo Gaitán",
        email: "rodrigo@example.com",
      },
    });
    expect(JSON.stringify(mapped)).not.toContain("password");
    expect(JSON.stringify(mapped)).not.toContain("role_id");
  });

  it("mapea detalle, cuota y planes sin inventar campos", () => {
    expect(mapPaymentResponseToDetail(response)).toMatchObject({
      scheduledPayment: null,
      paymentPlans: [],
      updatedAt: response.updated_at,
    });
  });

  it("FULL no envía payment_plan y normaliza strings decimales", () => {
    const payload = mapPaymentFormToCreatePayload(formValues("FULL"));
    expect(payload.amount).toBe("440.00");
    expect(payload.currency).toBe("PEN");
    expect(payload.transaccion_id).toBe("YAPE-123");
    expect(payload).not.toHaveProperty("payment_plan");
  });

  it("INSTALLMENTS envía el plan exacto, incluyendo number requerido por schema", () => {
    const payload = mapPaymentFormToCreatePayload(formValues("INSTALLMENTS"));
    expect(payload.payment_plan).toMatchObject({
      order_id: "order-1",
      total_installments: 3,
      total_amount: "440.00",
    });
    expect(payload.payment_plan?.scheduled_payments).toHaveLength(3);
    expect(payload.payment_plan?.scheduled_payments[0].number).toBe(1);
    expect(payload.payment_plan?.scheduled_payments[2].number).toBe(3);
  });

  it("distribuye cuotas y ajusta la última para mantener suma exacta", () => {
    const installments = generateInstallments("440", "3", "2026-07-24");
    expect(installments.map((item) => item.dueAmount)).toEqual([
      "146.67",
      "146.67",
      "146.66",
    ]);
    expect(
      installments.reduce((sum, item) => sum + Number(item.dueAmount), 0),
    ).toBe(440);
  });

  it("PUT solo contiene campos modificados permitidos", () => {
    const initial = {
      paymentDate: "2026-07-24T15:30",
      transactionId: "OLD",
      currency: "PEN",
    };
    expect(
      mapEditFormToPayload({ ...initial, transactionId: "NEW" }, initial),
    ).toEqual({ transaccion_id: "NEW" });
  });
});
