import api from "./client";
import type { CoursesResponse, CourseFormData, Course } from "@/types/course";

const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET || "admin-secret-key";

export const coursesApi = {
  getAll: (page = 1, limit = 20) =>
    api.get<CoursesResponse>("/courses", { params: { page, limit } }).then((r) => r.data),
  getById: (id: string) => api.get<Course>(`/courses/${id}`).then((r) => r.data),
  create: (data: CourseFormData) =>
    api.post("/courses", data, { headers: { "x-admin-secret": ADMIN_SECRET } }).then((r) => r.data),
  update: (id: string, data: Partial<CourseFormData>) =>
    api.put(`/courses/${id}`, data, { headers: { "x-admin-secret": ADMIN_SECRET } }).then((r) => r.data),
};
