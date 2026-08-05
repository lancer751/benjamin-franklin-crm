import type { OrderStatus } from "./types";

export const ORDER_STATUSES = ["PENDING", "COMPLETED", "CANCELLED", "REFUNDED"] as const;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  REFUNDED: "Reembolsada",
};

export const ORDER_STATUS_FILTER_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendientes",
  COMPLETED: "Completadas",
  CANCELLED: "Canceladas",
  REFUNDED: "Reembolsadas",
};
