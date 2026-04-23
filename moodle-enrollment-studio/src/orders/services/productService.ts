import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";

// ==========================================
// TIPOS INFERIDOS DESDE EL BACKEND
// ==========================================

type ProductsRes = InferResponseType<typeof api.products.$get>;
type ProductByIdRes = InferResponseType<typeof api.products[":id"]["$get"]>;
type CreateProductReq = InferRequestType<typeof api.products.$post>["json"];
type UpdateProductReq = InferRequestType<typeof api.products[":id"]["$put"]>["json"];
type DeleteProductRes = InferResponseType<typeof api.products[":id"]["$delete"]>;

// ==========================================
// SERVICIOS: PRODUCTOS
// ==========================================

export const getProducts = async (): Promise<ProductsRes> => {
  const res = await api.products.$get();
  return await res.json();
};

export const getProductById = async (id: string): Promise<ProductByIdRes> => {
  const res = await api.products[":id"].$get({ param: { id } });
  return await res.json();
};

export const createProduct = async (data: CreateProductReq) => {
  const res = await api.products.$post({ json: data });
  return await res.json();
};

export const updateProduct = async (id: string, data: UpdateProductReq) => {
  const res = await api.products[":id"].$put({ 
    param: { id },
    json: data 
  });
  return await res.json();
};

export const deleteProduct = async (id: string): Promise<DeleteProductRes> => {
  const res = await api.products[":id"].$delete({ param: { id } });
  return await res.json();
};