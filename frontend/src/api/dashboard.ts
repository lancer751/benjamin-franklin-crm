import api from "./client";
import type { DashboardResponse } from "@/types/dashboard";

export const dashboardApi = {
  getPayments: () => api.get<DashboardResponse>("/dashboard/payments").then((r) => r.data),
};
