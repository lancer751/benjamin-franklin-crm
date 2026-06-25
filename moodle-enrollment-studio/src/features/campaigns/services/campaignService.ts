import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";
import type { SuccessResponse } from "@/app";

// ==========================================
// INFERENCIA DE TIPOS ESTRICTA DESDE HONO
// ==========================================
export type CampaignsQueryReq = InferRequestType<typeof api.campaigns.$get>["query"];
export type CampaignsRes = InferResponseType<typeof api.campaigns.$get>;
export type CampaignByIdRes = InferResponseType<typeof api.campaigns[":id"]["$get"]>;
export type CreateCampaignReq = InferRequestType<typeof api.campaigns.$post>["json"];
export type UpdateCampaignReq = InferRequestType<typeof api.campaigns[":id"]["$put"]>["json"];
export type DeleteCampaignRes = InferResponseType<typeof api.campaigns[":id"]["$delete"]>;

// Endpoints para el Supervisor (Matriz Excalidraw)
export type AssignSellersReq = InferRequestType<typeof api.campaigns[":id"]["sellers"]["$post"]>["json"];
export type AssignSellersRes = InferResponseType<typeof api.campaigns[":id"]["sellers"]["$post"]>;

// ==========================================
// SERVICIOS COMERCIALES DE CAMPAÑAS
// ==========================================

/**
 * Obtener todas las campañas sincronizadas desde Meta.
 * Soporta filtros opcionales de Query mediante el esquema compartido.
 */
export const getCampaigns = async (query?: CampaignsQueryReq): Promise<CampaignsRes> => {
  const res = await api.campaigns.$get({ query: query || {} });
  return await res.json();
};

/**
 * Obtener los detalles específicos de una campaña por su UUID
 */
export const getCampaignById = async (id: string): Promise<CampaignByIdRes> => {
  const res = await api.campaigns[":id"].$get({ param: { id } });
  return await res.json();
};

/**
 * Crear nueva campaña (Mantenido para compatibilidad del formulario)
 */
export const createCampaign = async (data: CreateCampaignReq) => {
  const res = await api.campaigns.$post({ json: data });
  return await res.json();
};

/**
 * Actualizar los atributos comerciales de la campaña (Ej: Vincular el product_id)
 */
export const updateCampaign = async (id: string, data: UpdateCampaignReq) => {
  const res = await api.campaigns[":id"].$put({ 
    param: { id },
    json: data 
  });
  return await res.json();
};

/**
 * Eliminar el registro de una campaña del sistema
 */
export const deleteCampaign = async (id: string): Promise<DeleteCampaignRes> => {
  const res = await api.campaigns[":id"].$delete({ param: { id } });
  return await res.json();
};

// ==========================================
// ACCIONES EXCLUSIVAS DEL SUPERVISOR
// ==========================================

/**
 * Permite al supervisor asignar un lote de vendedores a una campaña específica
 */
export const assignSellersToCampaign = async (id: string, data: AssignSellersReq): Promise<AssignSellersRes> => {
  const res = await api.campaigns[":id"]["sellers"].$post({
    param: { id },
    json: data
  });
  return await res.json();
};

/**
 * Permite al supervisor remover a un vendedor del flujo de leads de la campaña
 */
export const removeSellerFromCampaign = async (id: string, sellerId: string): Promise<SuccessResponse> => {
  const res = await api.campaigns[":id"]["sellers"][":sellerId"].$delete({
    param: { id, sellerId }
  });
  return await res.json() as SuccessResponse;
};

/**
 * Obtener todos los miembros (leads) de una campaña con filtros opcionales
 */
export const getCampaignMembers = async (campaignId: string, query?: any) => {
  const res = await api.campaigns[":campaignId"]["members"].$get({
    param: { campaignId },
    query: query || {}
  });
  return await res.json();
};

/**
 * Reasignar un miembro (lead) de la campaña a otro asesor
 */
export const reassignCampaignMember = async (campaignId: string, memberId: string, data: { assigned_to: string }) => {
  const res = await api.campaigns[":campaignId"]["members"][":memberId"]["reassign"].$patch({
    param: { campaignId, memberId },
    json: data
  });
  return await res.json();
};