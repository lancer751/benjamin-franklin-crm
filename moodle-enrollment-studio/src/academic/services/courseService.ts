import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";

// ==========================================
// TIPOS INFERIDOS DESDE EL BACKEND
// ==========================================

// --- Cursos ---
type CoursesRes = InferResponseType<typeof api.courses.$get>;
type CourseByIdRes = InferResponseType<typeof api.courses[":id"]["$get"]>;
type CreateCourseReq = InferRequestType<typeof api.courses.$post>["json"];
type UpdateCourseReq = InferRequestType<typeof api.courses[":id"]["$put"]>["json"];
type DeleteCourseRes = InferResponseType<typeof api.courses[":id"]["$delete"]>;

// --- Ediciones ---
type EditionsRes = InferResponseType<typeof api.courses.editions.$get>;
// Nota: Asumiendo que UUID_ROUTE resuelve a "/:id" en el backend
type EditionByIdRes = InferResponseType<typeof api.courses.editions[":id"]["$get"]>;
type CreateEditionReq = InferRequestType<typeof api.courses.editions.$post>["json"];
type UpdateEditionReq = InferRequestType<typeof api.courses.editions[":id"]["$put"]>["json"];
type DeleteEditionRes = InferResponseType<typeof api.courses.editions[":id"]["$delete"]>;

// --- Modalidades ---
type ModalitiesRes = InferResponseType<typeof api.courses.modalities.$get>;
type CreateModalityReq = InferRequestType<typeof api.courses.modalities.$post>["json"];
type UpdateModalityReq = InferRequestType<typeof api.courses.modalities[":modalityId"]["$put"]>["json"];


// ==========================================
// SERVICIOS: CURSOS MASTER
// ==========================================

export const getCourses = async (): Promise<CoursesRes> => {
  const res = await api.courses.$get();
  return await res.json();
};

export const getCourseById = async (id: string): Promise<CourseByIdRes> => {
  const res = await api.courses[":id"].$get({ param: { id } });
  return await res.json();
};

export const createCourse = async (data: CreateCourseReq) => {
  const res = await api.courses.$post({ json: data });
  return await res.json();
};

export const updateCourse = async (id: string, data: UpdateCourseReq) => {
  const res = await api.courses[":id"].$put({
    param: { id },
    json: data
  });
  return await res.json();
};

export const deleteCourse = async (id: string): Promise<DeleteCourseRes> => {
  const res = await api.courses[":id"].$delete({ param: { id } });
  return await res.json();
};


// ==========================================
// SERVICIOS: EDICIONES DE CURSOS
// ==========================================

export const getCourseEditions = async (): Promise<EditionsRes> => {
  const res = await api.courses.editions.$get();
  return await res.json();
};

export const getCourseEditionById = async (id: string): Promise<EditionByIdRes> => {
  const res = await api.courses.editions[":id"].$get({ param: { id } });
  return await res.json();
};

export const createCourseEdition = async (data: CreateEditionReq) => {
  const res = await api.courses.editions.$post({ json: data });
  return await res.json();
};

export const updateCourseEdition = async (id: string, data: UpdateEditionReq) => {
  const res = await api.courses.editions[":id"].$put({
    param: { id },
    json: data
  });
  return await res.json();
};

export const deleteCourseEdition = async (id: string): Promise<DeleteEditionRes> => {
  const res = await api.courses.editions[":id"].$delete({ param: { id } });
  return await res.json();
};


// ==========================================
// SERVICIOS: MODALIDADES
// ==========================================

export const getModalities = async (): Promise<ModalitiesRes> => {
  const res = await api.courses.modalities.$get();
  return await res.json();
};

export const createModality = async (data: CreateModalityReq) => {
  const res = await api.courses.modalities.$post({ json: data });
  return await res.json();
};

export const updateModality = async (modalityId: string, data: UpdateModalityReq) => {
  const res = await api.courses.modalities[":modalityId"].$put({
    param: { modalityId },
    json: data
  });
  return await res.json();
};