import type { GetOrdersParams } from "./types";

export const orderQueryKeys = {
  all: ["orders"] as const,
  lists: () => ["orders", "list"] as const,
  list: (params: GetOrdersParams) => ["orders", "list", params] as const,
  details: () => ["orders", "detail"] as const,
  detail: (id: string) => ["orders", "detail", id] as const,
  leadContexts: () => ["orders", "lead-context"] as const,
  leadContext: (leadId: string) => ["orders", "lead-context", leadId] as const,
  products: ["orders", "products"] as const,
};
