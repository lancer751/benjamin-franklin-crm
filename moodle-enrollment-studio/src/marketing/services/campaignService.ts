import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";

// Inferencia de tipos desde el backend de Hono
type CampaignsRes = InferResponseType<typeof api.campaigns.$get>;
type CampaignByIdRes = InferResponseType<typeof api.campaigns[":id"]["$get"]>;
type CreateCampaignReq = InferRequestType<typeof api.campaigns.$post>["json"];
type UpdateCampaignReq = InferRequestType<typeof api.campaigns[":id"]["$put"]>["json"];
type DeleteCampaignRes = InferResponseType<typeof api.campaigns[":id"]["$delete"]>;

// Obtener todas las campañas
export const getCampaigns = async (): Promise<CampaignsRes> => {
  const res = await api.campaigns.$get();
  return await res.json();
};

// Obtener detalles de una campaña por ID
export const getCampaignById = async (id: string): Promise<CampaignByIdRes> => {
  const res = await api.campaigns[":id"].$get({ param: { id } });
  return await res.json();
};

// Crear nueva campaña
export const createCampaign = async (data: CreateCampaignReq) => {
  const res = await api.campaigns.$post({ json: data });
  return await res.json();
};

// Actualizar campaña
export const updateCampaign = async (id: string, data: UpdateCampaignReq) => {
  const res = await api.campaigns[":id"].$put({ 
    param: { id },
    json: data 
  });
  return await res.json();
};

// Eliminar campaña
export const deleteCampaign = async (id: string): Promise<DeleteCampaignRes> => {
  const res = await api.campaigns[":id"].$delete({ param: { id } });
  return await res.json();
};