import { describe, expect, it } from "vitest";
import type { PaymentResponse } from "../types";
import { mapPaymentResponseToDetail, mapPaymentResponseToListItem } from "./paymentMappers";

const response: PaymentResponse = {
  id: "payment-1",
  order_id: "order-1",
  scheduled_payment_id: "installment-1",
  payment_date: "2026-07-24T15:30:00.000Z",
  amount: "220",
  payment_method: "YAPE",
  payment_status: "PENDING",
  type: "INSTALLMENTS",
  currency: "PEN",
  transaccion_id: "YAPE-123",
  payment_receipt: "payment-evidence/key.pdf",
  created_at: "2026-07-24T15:31:00.000Z",
  updated_at: "2026-07-24T15:31:00.000Z",
  order: { id: "order-1", order_code: "REFTGEL", total_amount: "440", member: { lead: { id: "lead-1", first_name: "Rodrigo", last_name: "Gaitán" } } },
  schedulePayment: { id: "installment-1", due_date: "2026-08-24", due_amount: "220", number: 1, status: "PENDING", payment_plan: { orderDetail: { id: "detail-1", product: { id: "product-1", name: "Lectura de planos" } } } },
  creator: { id: "user-1", first_name: "Ana", last_name: "Romero" },
  reviewer: null,
};

describe("payment mappers", () => {
  it("normaliza contexto, cuota y auditoría", () => {
    expect(mapPaymentResponseToListItem(response)).toMatchObject({
      status: "PENDING",
      clientName: "Rodrigo Gaitán",
      productName: "Lectura de planos",
      installmentLabel: "Cuota 1",
      registeredBy: "Ana Romero",
      orderDetailId: "detail-1",
    });
  });

  it("mantiene la key privada del comprobante solo en detalle", () => {
    expect(mapPaymentResponseToDetail(response).receiptKey).toBe("payment-evidence/key.pdf");
    expect(mapPaymentResponseToListItem(response)).not.toHaveProperty("receiptKey");
  });

  it("presenta la primera obligación como matrícula cuando el producto la incluye", () => {
    const paymentWithEnrollment: PaymentResponse = {
      ...response,
      schedulePayment: {
        ...response.schedulePayment!,
        payment_plan: {
          orderDetail: {
            id: "detail-1",
            product: {
              id: "product-1",
              name: "Lectura de planos",
              enrollment_fee: "600.00",
            },
          },
        },
      },
    };

    expect(mapPaymentResponseToListItem(paymentWithEnrollment).installmentLabel).toBe("Matrícula");
    expect(mapPaymentResponseToListItem({
      ...paymentWithEnrollment,
      schedulePayment: { ...paymentWithEnrollment.schedulePayment!, number: 2 },
    }).installmentLabel).toBe("Cuota 1");
  });
});
