import { api } from "@/core/lib/api";
import { InferResponseType } from "hono/client";

// 1. Corregimos la inferencia: agregamos ".products" antes de ".categories"
export type CategoriesRes = InferResponseType<typeof api.products.categories.$get>;

// 2. Corregimos la llamada: accedemos a través de la cadena de mando correcta
export const getCategories = async (): Promise<CategoriesRes> => {
  const res = await api.products.categories.$get(); 
  return await res.json();
};