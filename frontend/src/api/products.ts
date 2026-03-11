import api from "./client";
import type { Product, CreateProductData } from "@/types/product";

export const productsApi = {
  getAll: () => api.get<Product[]>("/products").then((r) => r.data),
  getById: (id: string) => api.get<Product>(`/products/${id}`).then((r) => r.data),
  create: (data: CreateProductData) => api.post("/products", data).then((r) => r.data),
  update: (id: string, data: CreateProductData) => api.put(`/products/${id}`, data).then((r) => r.data),
};
