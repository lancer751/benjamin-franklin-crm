import { describe, expect, it } from "vitest";
import {
  calculateOrderPreview,
  getAvailableAttendanceModes,
  mapCreateFormToPayload,
  mapOrderToFormValues,
  mapUpdateFormToPayload,
} from "./orderMappers";
import { mapOrderApiError, OrderApiError } from "./orderService";
import type {
  OrderFormValues,
  OrderProduct,
  OrderResponse,
} from "../types";

const product: OrderProduct = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Producto",
  sales_status: "PUBLISHED",
  prices: [
    { attendance_mode: "VIRTUAL", cash_price: "120.00" },
    { attendance_mode: "PRESENCIAL", cash_price: "180.00" },
  ],
};

const values: OrderFormValues = {
  lead_id: "22222222-2222-4222-8222-222222222222",
  discount: "20",
  order_status: "PENDING",
  order_items: [
    {
      product_id: product.id,
      attendance_mode: "VIRTUAL",
      discount_code: "",
    },
  ],
};

describe("order mappers", () => {
  it("filtra modalidades según los ProductPrice disponibles", () => {
    expect(getAvailableAttendanceModes([product], product.id)).toEqual([
      "VIRTUAL",
      "PRESENCIAL",
    ]);
  });

  it("calcula subtotal y total visual", () => {
    expect(calculateOrderPreview(values, [product])).toEqual({
      subtotal: 120,
      discount: 20,
      total: 100,
    });
  });

  it("crea el payload exacto sin precios, totales, estado ni generated_by", () => {
    expect(mapCreateFormToPayload(values)).toEqual({
      lead_id: values.lead_id,
      discount: "20.00",
      order_items: [
        {
          product_id: product.id,
          attendance_mode: "VIRTUAL",
          discount_code: null,
        },
      ],
    });
  });

  it("al cambiar descuento incluye todos los order_items", () => {
    const next = { ...values, discount: "30" };
    expect(mapUpdateFormToPayload(next, values)).toEqual({
      discount: "30.00",
      order_items: [
        {
          product_id: product.id,
          attendance_mode: "VIRTUAL",
          discount_code: null,
        },
      ],
    });
  });

  it("al cambiar solo estado envía únicamente order_status", () => {
    expect(
      mapUpdateFormToPayload(
        { ...values, order_status: "CANCELLED" },
        values,
      ),
    ).toEqual({ order_status: "CANCELLED" });
  });

  it("nunca incluye lead_id en una actualización", () => {
    expect(mapUpdateFormToPayload({ ...values, lead_id: "otro" }, values)).toEqual(
      {},
    );
  });

  it("bloquea la edición de ítems si el GET no devuelve attendance_mode", () => {
    const order = {
      id: "33333333-3333-4333-8333-333333333333",
      lead_id: values.lead_id,
      sub_total: "120.00",
      total_amount: "100.00",
      discount: "20.00",
      order_status: "PENDING",
      order_code: "ABC1234",
      created_at: "2026-07-23T00:00:00.000Z",
      updated_at: "2026-07-23T00:00:00.000Z",
      lead: {
        id: values.lead_id,
        first_name: "Ana",
        last_name: "Pérez",
        email: "ana@example.com",
      },
      orderDetails: [
        {
          id: "44444444-4444-4444-8444-444444444444",
          product_id: product.id,
          price: "120.00",
          discount_code: null,
          product: { id: product.id, name: product.name },
        },
      ],
    } satisfies OrderResponse;
    const mapped = mapOrderToFormValues(order);
    expect(mapped.canEditItems).toBe(false);
    expect(mapped.values.order_items).toEqual([]);
  });
});

describe("order API errors", () => {
  it.each([
    [404, "Lead not found", "El prospecto seleccionado no existe"],
    [404, "Order not found", "La orden no existe"],
    [422, "No price found for product X", "No existe un precio configurado"],
    [
      400,
      "Discount must be between 0 and the order subtotal",
      "El descuento debe estar",
    ],
    [
      400,
      "Cannot complete order with unpaid balance. Create payments first.",
      "saldo pendiente",
    ],
  ])("mapea el error %s", (status, message, expected) => {
    expect(mapOrderApiError(new OrderApiError(status, message))).toContain(
      expected,
    );
  });
});
