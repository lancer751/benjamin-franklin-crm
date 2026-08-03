import { describe, expect, it } from "vitest";
import type { OrderListItem } from "../types";
import {
  canCancelOrder,
  canDeleteOrder,
  canRegisterPaymentFromList,
  getOrderListPermissions,
} from "./orderPermissions";

const order = {
  id: "order",
  orderCode: "ORDER",
  status: "PENDING",
  subtotal: "100.00",
  totalAmount: "100.00",
  discount: "0.00",
  createdAt: "2026-07-24T00:00:00.000Z",
  lead: { fullName: "Ana", email: null, dni: null },
  seller: null,
  products: [],
} satisfies OrderListItem;

describe("order list permissions", () => {
  it("permite crear, editar y cobrar a roles comerciales", () => {
    const permissions = getOrderListPermissions("SALES_REP");
    expect(permissions.canCreate).toBe(true);
    expect(permissions.canEdit).toBe(true);
    expect(canRegisterPaymentFromList(order, permissions)).toBe(true);
    expect(canCancelOrder(order, permissions)).toBe(true);
    expect(canDeleteOrder(order, permissions)).toBe(false);
  });

  it("restringe acciones de escritura a MARKETING", () => {
    const permissions = getOrderListPermissions("MARKETING");
    expect(permissions.canCreate).toBe(false);
    expect(permissions.canEdit).toBe(false);
    expect(canRegisterPaymentFromList(order, permissions)).toBe(false);
    expect(canCancelOrder(order, permissions)).toBe(false);
    expect(canDeleteOrder(order, permissions)).toBe(false);
  });

  it("solo permite eliminar a ADMIN y SALES_SUPERVISOR", () => {
    expect(
      canDeleteOrder(order, getOrderListPermissions("ADMIN")),
    ).toBe(true);
    expect(
      canDeleteOrder(order, getOrderListPermissions("SALES_SUPERVISOR")),
    ).toBe(true);
  });
});
