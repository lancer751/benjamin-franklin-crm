import { describe, expect, it } from "vitest";
import type { OrderResponse } from "../types";
import {
  calculateOrderListMetrics,
  filterOrderListItems,
  mapOrderResponseToListItem,
} from "./orderListMappers";

const unsafeUser = {
  first_name: "Miguel",
  middle_name: "",
  last_name: "Torres",
  corporate_email: "mtorres@bf.edu.pe",
  email: "miguel@example.com",
  is_active: true,
  password: "sensitive-hash",
  role_id: "internal-role",
};

const responseOrder: OrderResponse = {
  id: "54566a99-2980-4147-9f75-a61906cf8344",
  lead_id: "543fd75a-e25c-4eb3-96f0-1841d56a0fe7",
  generated_by: "fc31c497-79e5-4cc5-8200-c0083e914eb0",
  sub_total: "460",
  total_amount: "440",
  discount: "20",
  order_status: "PENDING",
  order_code: "REFTGEL",
  created_at: "2026-07-24T02:09:05.552Z",
  updated_at: "2026-07-24T02:09:05.552Z",
  lead: {
    id: "543fd75a-e25c-4eb3-96f0-1841d56a0fe7",
    first_name: "Rodrigo",
    middle_name: "",
    last_name: "Gaitán Arenas",
    email: "rodrigo@example.com",
    dni: "12345678",
  },
  seller: {
    id: "seller-id",
    user: unsafeUser,
  },
  orderDetails: [
    {
      id: "detail-1",
      product_id: "product-1",
      price: "440",
      discount_code: null,
      product: {
        id: "product-1",
        name: "Curso de Lectura de Planos",
      },
    },
  ],
};

describe("order list mappers", () => {
  it("mapea únicamente los campos seguros requeridos por el listado", () => {
    const item = mapOrderResponseToListItem(responseOrder);

    expect(item).toEqual({
      id: responseOrder.id,
      orderCode: "REFTGEL",
      status: "PENDING",
      subtotal: "460.00",
      totalAmount: "440.00",
      discount: "20.00",
      createdAt: responseOrder.created_at,
      lead: {
        fullName: "Rodrigo Gaitán Arenas",
        email: "rodrigo@example.com",
        dni: "12345678",
      },
      seller: {
        fullName: "Miguel Torres",
        email: "mtorres@bf.edu.pe",
        initials: "MT",
      },
      products: [
        { name: "Curso de Lectura de Planos", price: "440.00" },
      ],
    });
    expect(JSON.stringify(item)).not.toContain("password");
    expect(JSON.stringify(item)).not.toContain("role_id");
    expect(JSON.stringify(item)).not.toContain("sensitive-hash");
  });

  it("usa el fallback correcto cuando seller es null", () => {
    expect(
      mapOrderResponseToListItem({ ...responseOrder, seller: null }).seller,
    ).toBeNull();
  });

  it.each([
    ["reftgel", "código"],
    ["rodrigo gaitán", "cliente"],
    ["rodrigo@example.com", "correo"],
    ["12345678", "DNI"],
    ["miguel torres", "asesor"],
    ["lectura de planos", "producto"],
    ["gaitan", "cliente sin tilde"],
  ])("busca por %s (%s)", (query) => {
    const item = mapOrderResponseToListItem(responseOrder);
    expect(filterOrderListItems([item], query, "ALL")).toEqual([item]);
  });

  it("filtra por estado", () => {
    const pending = mapOrderResponseToListItem(responseOrder);
    const completed = {
      ...pending,
      id: "completed",
      status: "COMPLETED" as const,
    };

    expect(
      filterOrderListItems([pending, completed], "", "COMPLETED"),
    ).toEqual([completed]);
  });

  it("calcula métricas y total vendido solo con órdenes completadas", () => {
    const pending = mapOrderResponseToListItem(responseOrder);
    const completed = {
      ...pending,
      id: "completed",
      status: "COMPLETED" as const,
      totalAmount: "600.00",
    };
    const cancelled = {
      ...pending,
      id: "cancelled",
      status: "CANCELLED" as const,
      totalAmount: "900.00",
    };

    expect(
      calculateOrderListMetrics([pending, completed, cancelled]),
    ).toEqual({
      total: 3,
      completed: 1,
      pending: 1,
      totalSold: 600,
    });
  });
});
