import { api } from "@/core/lib/api";
import { InferResponseType } from "hono/client";

// Tipos inferidos desde el backend
export type CategoriesRes = InferResponseType<typeof api.categories.$get>;

// Obtener todas las categorías
export const getCategories = async (): Promise<CategoriesRes> => {
  const res = await api.categories.$get();
  return await res.json();
};
