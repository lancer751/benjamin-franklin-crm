import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";
import { UUID_PATH } from '@/core/lib/constants';

export type ProfessorsRes = InferResponseType<typeof api.academic.professors.$get>;
export type ProfessorByIdRes = InferResponseType<(typeof api.academic.professors)[typeof UUID_PATH]["$get"]>;
export type CreateProfessorReq = InferRequestType<typeof api.academic.professors.$post>["json"];
export type UpdateProfessorReq = InferRequestType<(typeof api.academic.professors)[typeof UUID_PATH]["$put"]>["json"];
export type DeleteProfessorRes = InferResponseType<(typeof api.academic.professors)[typeof UUID_PATH]["$delete"]>;

export const getProfessors = async (): Promise<ProfessorsRes> => {
  const res = await api.academic.professors.$get();
  return await res.json();
};

export const getProfessorById = async (id: string): Promise<ProfessorByIdRes> => {
  const res = await (api.academic.professors as any)[UUID_PATH].$get({ param: { id } });
  return await res.json();
};

export const createProfessor = async (data: CreateProfessorReq) => {
  const res = await api.academic.professors.$post({ json: data });
  return await res.json();
};

export const updateProfessor = async (id: string, data: UpdateProfessorReq) => {
  const res = await (api.academic.professors as any)[UUID_PATH].$put({
    param: { id },
    json: data
  });
  return await res.json();
};

export const deleteProfessor = async (id: string): Promise<DeleteProfessorRes> => {
  const res = await (api.academic.professors as any)[UUID_PATH].$delete({ param: { id } });
  return await res.json();
};
