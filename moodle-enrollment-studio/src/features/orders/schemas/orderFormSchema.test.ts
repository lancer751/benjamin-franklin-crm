import { describe, expect, it } from "vitest";
import { buildOrderFormSchema } from "./orderFormSchema";
import type { OrderProduct } from "../types";

const product: OrderProduct = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Curso de prueba",
  sales_status: "ON_SALE",
  prices: [
    { attendance_mode: "VIRTUAL", cash_price: "100.00" },
    { attendance_mode: "PRESENCIAL", cash_price: "150.00" },
  ],
};

const validValues = {
  lead_id: "22222222-2222-4222-8222-222222222222",
  discount: "10.00",
  order_items: [
    {
      product_id: product.id,
      attendance_mode: "VIRTUAL" as const,
      discount_code: null,
    },
  ],
};

describe("orderFormSchema", () => {
  const schema = buildOrderFormSchema([product], {
    requireLead: true,
    requireItems: true,
  });

  it("no permite crear sin prospecto", () => {
    expect(schema.safeParse({ ...validValues, lead_id: "" }).success).toBe(false);
  });

  it("no permite crear sin productos", () => {
    expect(schema.safeParse({ ...validValues, order_items: [] }).success).toBe(
      false,
    );
  });

  it("no permite repetir producto y modalidad", () => {
    const result = schema.safeParse({
      ...validValues,
      order_items: [...validValues.order_items, ...validValues.order_items],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes("ya fueron agregados"))).toBe(true);
    }
  });

  it("no permite un descuento superior al subtotal", () => {
    expect(
      schema.safeParse({ ...validValues, discount: "100.01" }).success,
    ).toBe(false);
  });
});
