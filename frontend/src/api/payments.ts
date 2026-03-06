import api from "./client";
import type { Payment, ManualPaymentData } from "@/types/payment";

const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || "admin-secret-key";

export const paymentsApi = {
  getAll: () => api.get<{ payments: Payment[] }>("/payments").then((r) => r.data.payments),
  getById: (id: string) => api.get<Payment>(`/payments/${id}`).then((r) => r.data),
  createManual: (data: ManualPaymentData) =>
    api.post("/payments/manual", data, { headers: { "x-admin-secret": ADMIN_SECRET } }).then((r) => r.data),
  updateStatus: (id: string, paymentStatus: string) =>
    api.put(`/payments/manual/${id}`, { paymentStatus }, { headers: { "x-admin-secret": ADMIN_SECRET } }).then((r) => r.data),
};
