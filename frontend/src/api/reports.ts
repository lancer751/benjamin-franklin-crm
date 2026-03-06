import api from "./client";
import type { SalesReport } from "@/types/report";

export const reportsApi = {
  getSales: (params: { startDate: string; endDate: string; courseId?: string; paymentMethod?: string }) =>
    api.get<SalesReport>("/reports/sales", { params }).then((r) => r.data),
};
