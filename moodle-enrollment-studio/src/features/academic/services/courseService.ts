import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";
import {UUID_PATH} from '@/core/lib/constants'

// ==========================================
// TIPOS INFERIDOS
// ==========================================

// --- Cursos ---
export type CoursesRes = InferResponseType<typeof api.courses.$get>;
export type CourseByIdRes = InferResponseType<(typeof api.courses)[typeof UUID_PATH]["$get"]>;
export type CreateCourseReq = InferRequestType<typeof api.courses.$post>["json"];
export type UpdateCourseReq = InferRequestType<(typeof api.courses)[typeof UUID_PATH]["$put"]>["json"];
export type DeleteCourseRes = InferResponseType<(typeof api.courses)[typeof UUID_PATH]["$delete"]>;

// --- Ediciones ---
export type EditionsRes = InferResponseType<typeof api.courses.editions.$get>;
// Nota: Para ediciones el backend usa ":id" simple o el UUID_PATH, 
// ajustamos según lo que devuelva el autocompletado
export type EditionByIdRes = InferResponseType<(typeof api.courses.editions)[":id"]["$get"]>;
export type CreateEditionReq = InferRequestType<typeof api.courses.editions.$post>["json"];
export type UpdateEditionReq = InferRequestType<(typeof api.courses.editions)[":id"]["$put"]>["json"];
export type DeleteEditionRes = InferResponseType<typeof api.courses.editions[":id"]["$delete"]>;

// ==========================================
// SERVICIOS: CURSOS
// ==========================================

export const getCourses = async (): Promise<CoursesRes> => {
  const res = await api.courses.$get();
  return await res.json();
};

export const getCourseById = async (id: string): Promise<CourseByIdRes> => {
  // Accedemos usando la constante para que TypeScript no se queje
  const res = await (api.courses as any)[UUID_PATH].$get({ param: { id } });
  return await res.json();
};

export const createCourse = async (data: CreateCourseReq) => {
  const res = await api.courses.$post({ json: data });
  return await res.json();
};

export const updateCourse = async (id: string, data: UpdateCourseReq) => {
  const res = await (api.courses as any)[UUID_PATH].$put({
    param: { id },
    json: data
  });
  return await res.json();
};

export const deleteCourse = async (id: string): Promise<DeleteCourseRes> => {
  const res = await (api.courses as any)[UUID_PATH].$delete({ param: { id } });
  return await res.json();
};

// ==========================================
// SERVICIOS: EDICIONES
// ==========================================

export const getCourseEditions = async (): Promise<EditionsRes> => {
  const res = await api.courses.editions.$get();
  return await res.json();
};

export const createCourseEdition = async (data: CreateEditionReq) => {
  const res = await api.courses.editions.$post({ json: data });
  return await res.json();
};

// ==========================================
// SERVICIOS: EDICIONES (SIN ANY)
// ==========================================

export const getCourseEditionById = async (id: string): Promise<EditionByIdRes> => {
  // Ahora TS reconocerá que dentro de editions existe el path dinámico
  const res = await api.courses.editions[":id"].$get({ param: { id } });
  return await res.json();
};

export const updateCourseEdition = async (id: string, data: UpdateEditionReq) => {
  // Al poner la barra en el backend, esto ya no necesita "as any"
  const res = await api.courses.editions[":id"].$put({
    param: { id },
    json: data
  });
  return await res.json();
};

export const deleteCourseEdition = async (id: string): Promise<DeleteEditionRes> => {
  const res = await api.courses.editions[":id"].$delete({ 
    param: { id } 
  });
  return await res.json();
};