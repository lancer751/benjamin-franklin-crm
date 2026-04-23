import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";

// ==========================================
// TIPOS INFERIDOS DESDE EL BACKEND
// ==========================================

type OrdersRes = InferResponseType<typeof api.orders.$get>;
type OrderByIdRes = InferResponseType<typeof api.orders[":id"]["$get"]>;
type CreateOrderReq = InferRequestType<typeof api.orders.$post>["json"];
type UpdateOrderReq = InferRequestType<typeof api.orders[":id"]["$put"]>["json"];
type DeleteOrderRes = InferResponseType<typeof api.orders[":id"]["$delete"]>;

// ==========================================
// SERVICIOS: ÓRDENES
// ==========================================

export const getOrders = async (): Promise<OrdersRes> => {
  const res = await api.orders.$get();
  return await res.json();
};

export const getOrderById = async (id: string): Promise<OrderByIdRes> => {
  const res = await api.orders[":id"].$get({ param: { id } });
  return await res.json();
};

export const createOrder = async (data: CreateOrderReq) => {
  const res = await api.orders.$post({ json: data });
  return await res.json();
};

export const updateOrder = async (id: string, data: UpdateOrderReq) => {
  const res = await api.orders[":id"].$put({ 
    param: { id },
    json: data 
  });
  return await res.json();
};

export const deleteOrder = async (id: string): Promise<DeleteOrderRes> => {
  const res = await api.orders[":id"].$delete({ param: { id } });
  return await res.json();
};