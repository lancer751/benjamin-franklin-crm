import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";
import { UUID_PATH } from "@/core/lib/constants";

type CertificationsRes = InferResponseType<typeof api.cms.certifications.$get>;
type CertificationByIdRes = InferResponseType<(typeof api.cms.certifications)[typeof UUID_PATH]["$get"]>;
type CreateCertificationReq = InferRequestType<typeof api.cms.certifications.$post>["json"];
type UpdateCertificationReq = InferRequestType<(typeof api.cms.certifications)[typeof UUID_PATH]["$put"]>["json"];
type DeleteCertificationRes = InferResponseType<(typeof api.cms.certifications)[typeof UUID_PATH]["$delete"]>;

export const getCertifications = async (): Promise<CertificationsRes> => {
  const res = await api.cms.certifications.$get();
  return await res.json();
};

export const getCertificationById = async (id: string): Promise<CertificationByIdRes> => {
  const res = await api.cms.certifications[":id"].$get({ param: { id } });
  return await res.json();
};

export const createCertification = async (data: CreateCertificationReq) => {
  const res = await api.cms.certifications.$post({ json: data });
  return await res.json();
};

export const updateCertification = async (id: string, data: UpdateCertificationReq) => {
  const res = await api.cms.certifications[":id"].$put({ 
    param: { id },
    json: data 
  });
  return await res.json();
};

export const deleteCertification = async (id: string): Promise<DeleteCertificationRes> => {
  const res = await api.cms.certifications[":id"].$delete({ param: { id } });
  return await res.json();
};
