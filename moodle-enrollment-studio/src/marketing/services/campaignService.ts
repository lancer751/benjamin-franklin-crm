import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";

// Inferencia de tipos desde el backend de Hono
type CampaignsRes = InferResponseType<typeof api.campaings.$get>;
type CampaignByIdRes = InferResponseType<typeof api.campaings[":id"]["$get"]>;
type CreateCampaignReq = InferRequestType<typeof api.campaings.$post>["json"];
type UpdateCampaignReq = InferRequestType<typeof api.campaings[":id"]["$put"]>["json"];
type DeleteCampaignRes = InferResponseType<typeof api.campaings[":id"]["$delete"]>;

// Obtener todas las campañas
export const getCampaigns = async (): Promise<CampaignsRes> => {
  const res = await api.campaings.$get();
  return await res.json();
};

// Obtener detalles de una campaña por ID
export const getCampaignById = async (id: string): Promise<CampaignByIdRes> => {
  const res = await api.campaings[":id"].$get({ param: { id } });
  return await res.json();
};

// Crear nueva campaña
export const createCampaign = async (data: CreateCampaignReq) => {
  const res = await api.campaings.$post({ json: data });
  return await res.json();
};

// Actualizar campaña
export const updateCampaign = async (id: string, data: UpdateCampaignReq) => {
  const res = await api.campaings[":id"].$put({ 
    param: { id },
    json: data 
  });
  return await res.json();
};

// Eliminar campaña
export const deleteCampaign = async (id: string): Promise<DeleteCampaignRes> => {
  const res = await api.campaings[":id"].$delete({ param: { id } });
  return await res.json();
};