import type { OrderListItem } from "../types";

export interface OrderListPermissions {
  canCreate: boolean;
  canEdit: boolean;
  canCancel: boolean;
  canDelete: boolean;
  canRegisterPayment: boolean;
}

const writeRoles = new Set(["ADMIN", "SALES_REP", "SALES_SUPERVISOR"]);

export function getOrderListPermissions(
  role?: string,
): OrderListPermissions {
  const canWrite = writeRoles.has(role ?? "");
  return {
    canCreate: canWrite,
    canEdit: canWrite,
    canCancel: canWrite,
    canDelete: ["ADMIN", "SALES_SUPERVISOR"].includes(role ?? ""),
    canRegisterPayment: canWrite,
  };
}

export function canCancelOrder(
  order: OrderListItem,
  permissions: OrderListPermissions,
): boolean {
  return permissions.canCancel && order.status === "PENDING";
}

export function canDeleteOrder(
  order: OrderListItem,
  permissions: OrderListPermissions,
): boolean {
  return permissions.canDelete && order.status !== "COMPLETED";
}

export function canRegisterPaymentFromList(
  order: OrderListItem,
  permissions: OrderListPermissions,
): boolean {
  return permissions.canRegisterPayment && order.status === "PENDING";
}
