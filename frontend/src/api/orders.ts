import api from "./client";
import type { OrderListItem, OrderDetail, CreateOrderData } from "@/types/order";

export const ordersApi = {
  getAll: () => api.get<OrderListItem[]>("/orders").then((r) => r.data),
  getById: (id: string) => api.get<OrderDetail>(`/orders/${id}`).then((r) => r.data),
  create: (data: CreateOrderData) => api.post("/orders", data).then((r) => r.data),
  update: (id: string, data: unknown) => api.put(`/orders/${id}`, data).then((r) => r.data),
};
