import api from "./client";
import type { Enrollment, EnrollmentDetail, CreateEnrollmentData } from "@/types/enrollment";

export const enrollmentsApi = {
  getAll: () => api.get<Enrollment[]>("/enrollments").then((r) => r.data),
  getById: (id: string) => api.get<EnrollmentDetail>(`/enrollments/${id}`).then((r) => r.data),
  create: (data: CreateEnrollmentData) => api.post("/enrollments", data).then((r) => r.data),
  updateStatus: (id: string, estado: string) => api.put(`/enrollments/${id}`, { estado }).then((r) => r.data),
};
