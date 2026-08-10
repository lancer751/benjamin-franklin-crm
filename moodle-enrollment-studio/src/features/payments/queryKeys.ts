import type { PaymentListFilters } from "./types";

export const paymentsKeys = {
  all: ["payments"] as const,
  lists: () => ["payments", "list"] as const,
  list: (filters: PaymentListFilters) => ["payments", "list", filters] as const,
  details: () => ["payments", "detail"] as const,
  detail: (id: string) => ["payments", "detail", id] as const,
  receipt: (id: string) => ["payments", "detail", id, "receipt"] as const,
};

export const paymentPlanKeys = {
  all: ["payment-plans"] as const,
  details: () => ["payment-plans", "detail"] as const,
  detail: (orderId: string, detailId: string) =>
    ["payment-plans", orderId, detailId] as const,
};
