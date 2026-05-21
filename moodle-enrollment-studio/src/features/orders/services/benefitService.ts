import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";
import { UUID_PATH } from "@/core/lib/constants";

// ==========================================
// TIPOS INFERIDOS DESDE EL BACKEND (BENEFITS)
// ==========================================

type BenefitsRes = InferResponseType<typeof api.products.benefits.$get>;
type BenefitByIdRes = InferResponseType<(typeof api.products.benefits)[typeof UUID_PATH]["$get"]>;
type CreateBenefitReq = InferRequestType<typeof api.products.benefits.$post>["json"];
type UpdateBenefitReq = InferRequestType<(typeof api.products.benefits)[typeof UUID_PATH]["$put"]>["json"];
type DeleteBenefitRes = InferResponseType<(typeof api.products.benefits)[typeof UUID_PATH]["$delete"]>;

// ==========================================
// SERVICIOS: BENEFITS
// ==========================================

export const getBenefits = async (): Promise<BenefitsRes> => {
  const res = await api.products.benefits.$get();
  return await res.json();
};

export const getBenefitById = async (id: string): Promise<BenefitByIdRes> => {
  const res = await api.products.benefits[":id"].$get({ param: { id } });
  return await res.json();
};

export const createBenefit = async (data: CreateBenefitReq) => {
  const res = await api.products.benefits.$post({ json: data });
  return await res.json();
};

export const updateBenefit = async (id: string, data: UpdateBenefitReq) => {
  const res = await api.products.benefits[":id"].$put({ 
    param: { id },
    json: data 
  });
  return await res.json();
};

export const deleteBenefit = async (id: string): Promise<DeleteBenefitRes> => {
  const res = await api.products.benefits[":id"].$delete({ param: { id } });
  return await res.json();
};