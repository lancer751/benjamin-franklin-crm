import api from "./client";
import type { Customer, CustomerFormData } from "@/types/customer";

export const customersApi = {
  getAll: () => api.get<Customer[]>("/customers").then((r) => r.data),
  getById: (id: string) => api.get<Customer>(`/customers/${id}`).then((r) => r.data),
  create: (data: CustomerFormData) => api.post<Customer>("/customers", data).then((r) => r.data),
  update: (id: string, data: Partial<CustomerFormData>) => api.put<Customer>(`/customers/${id}`, data).then((r) => r.data),
};
