import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";

// Inferencia de tipos para Leads
type GetAllLeadsRes = InferResponseType<typeof api.leads.$get>;
type CreateLeadReq = InferRequestType<typeof api.leads.$post>["json"];
type UpdateLeadReq = InferRequestType<typeof api.leads[":id"]["$put"]>["json"];
type DeleteLeadRes = InferResponseType<typeof api.leads[":id"]["$delete"]>;
type GetLeadByIdRes = InferResponseType<typeof api.leads[":id"]["$get"]>;
type GetLeadInteractionsRes = InferResponseType<typeof api.leads[":id"]["interactions"]["$get"]>;
type CreateInteractionReq = InferRequestType<typeof api.leads.interactions.$post>["json"];
type CreateInteractionRes = InferResponseType<typeof api.leads.interactions.$post>;

export const getAllLeads = async (): Promise<GetAllLeadsRes> => {
  const res = await api.leads.$get();
  return await res.json();
};

export const createLead = async (data: CreateLeadReq) => {
  const res = await api.leads.$post({ json: data });
  return await res.json();
};

export const updateLead = async (id: string, data: UpdateLeadReq) => {
  const res = await api.leads[":id"].$put({ 
    param: { id },
    json: data 
  });
  return await res.json();
};

export const deleteLead = async (id: string): Promise<DeleteLeadRes> => {
  const res = await api.leads[":id"].$delete({ param: { id } });
  return await res.json();
};

export const getLeadById = async (id: string): Promise<GetLeadByIdRes> => {
  const res = await api.leads[":id"].$get({ param: { id } });
  return await res.json();
};

export const getLeadInteractions = async (id: string): Promise<GetLeadInteractionsRes> => {
  const res = await api.leads[":id"].interactions.$get({ param: { id } });
  return await res.json();
};

export const createInteraction = async (data: CreateInteractionReq): Promise<CreateInteractionRes> => {
  const res = await api.leads.interactions.$post({ json: data });
  return await res.json();
};