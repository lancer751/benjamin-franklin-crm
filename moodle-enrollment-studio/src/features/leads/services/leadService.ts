import { api } from "@/core/lib/api";
import { InferRequestType, InferResponseType } from "hono/client";

// Constantes exactas del backend para resolver el tipado RPC
const UUID_PATH = ":id{[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}}" as const;
const MEMBER_PATH = "/:memberId/status" as const; // Ruta base inferred para sub-recursos

// ==========================================
// TIPOS INFERIDOS (Sincronizados con el Backend)
// ==========================================

// 1. Rutas de Leads (/api/leads)
export type GetAllLeadsRes = InferResponseType<typeof api.leads.$get>;
export type GetLeadByIdRes = InferResponseType<(typeof api.leads)[typeof UUID_PATH]["$get"]>;
export type CreateLeadReq = InferRequestType<typeof api.leads.$post>["json"];
export type UpdateLeadReq = InferRequestType<(typeof api.leads)[typeof UUID_PATH]["$put"]>["json"];
export type LeadQuerySchemaInput = InferRequestType<typeof api.leads.$get>["query"];

// 2. Rutas de Miembros de Campaña (/api/campaigns/:campaignId/members)
// Para acceder a los métodos anidados del sub-router usamos casting limpio o invocación directa por convención RPC
export type GetCampaignMembersRes = InferResponseType<typeof api.campaigns[typeof UUID_PATH]["members"]["$get"]>;
export type CreateCampaignMemberReq = InferRequestType<typeof api.campaigns[typeof UUID_PATH]["members"]["$post"]>["json"];
export type UpdateMemberStatusReq = InferRequestType<typeof api.campaigns[typeof UUID_PATH]["members支撑" /* Fallback seguro para strings string */]["$patch"]>["json"];

// ==========================================
// SERVICIOS: LEADS
// ==========================================

/** Obtiene la lista unificada y paginada de todos los leads */
export const getAllLeads = async (query?: LeadQuerySchemaInput): Promise<GetAllLeadsRes> => {
  const res = await api.leads.$get({ query: query as any });
  return await res.json();
};

/** Obtiene el perfil detallado de un lead por su UUID */
export const getLeadById = async (id: string): Promise<GetLeadByIdRes> => {
  const res = await (api.leads as any)[UUID_PATH].$get({ param: { id } });
  return await res.json();
};

/** Registra un nuevo lead base (con sus respectivos teléfonos) */
export const createLead = async (data: CreateLeadReq): Promise<InferResponseType<typeof api.leads.$post>> => {
  const res = await api.leads.$post({ json: data });
  return await res.json();
};

/** Actualiza los datos planos del perfil de un lead */
export const updateLead = async (id: string, data: UpdateLeadReq): Promise<InferResponseType<(typeof api.leads)[typeof UUID_PATH]["$put"]>> => {
  const res = await (api.leads as any)[UUID_PATH].$put({
    param: { id },
    json: data
  });
  return await res.json();
};

// ==========================================
// SERVICIOS: CAMPAIGN MEMBERS (Distribución y Seguimiento)
// ==========================================

/** GET: Obtiene todos los miembros asignados a una campaña específica */
export const getCampaignMembers = async (campaignId?: string, query?: any): Promise<any> => {
  // Si no hay campaignId, nos aseguramos de no enviarle la expresión regular cruda a Hono
  const paramField = campaignId ? campaignId : "all";

  const res = await (api.campaigns as any)[paramField].members.$get({
    query
  });
  return await res.json();
};

/** POST: Asigna o añade un Lead existente a una campaña (Crea el CampaignMember) */
export const addLeadToCampaign = async (campaignId: string, data: any): Promise<any> => {
  const serverUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");
  const url = `${serverUrl}/api/campaigns/${campaignId}/members`;
  
  const csrfToken = document.cookie
    .split("; ")
    .find((item) => item.trim().startsWith("xxx-csrf-access-token="))
    ?.split("=")[1];

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (csrfToken) {
    headers["xxx-csrf-access-token"] = decodeURIComponent(csrfToken);
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(data),
  });
  
  return await res.json();
};

/** PATCH: Actualiza el estado de tipificación comercial de un miembro (:memberId/status) */
export const updateMemberStatus = async (campaignId: string, memberId: string, status: string): Promise<any> => {
  const res = await (api.campaigns as any)[UUID_PATH].members[`:${memberId}/status` as any].$patch({
    param: { campaignId, memberId },
    json: { status }
  });
  return await res.json();
};

/** PATCH: Reasigna el prospecto de la campaña a otro asesor comercial (:memberId/reassign) */
export const reassignMember = async (campaignId: string, memberId: string, assignedTo: string): Promise<any> => {
  const res = await (api.campaigns as any)[UUID_PATH].members[`:${memberId}/reassign` as any].$patch({
    param: { campaignId, memberId },
    json: { assigned_to: assignedTo }
  });
  return await res.json();
};

// ==========================================
// SERVICIOS: SUB-RECURSOS (Interacciones y Tareas)
// ==========================================

/** GET: Obtiene el historial de interacciones y comentarios de gestión de un miembro */
export const getMemberInteractions = async (campaignId: string, memberId: string): Promise<any> => {
  const res = await (api.campaigns as any)[UUID_PATH].members[`:${memberId}/interactions` as any].$get({
    param: { campaignId, memberId }
  });
  return await res.json();
};

/** POST: Registra una nueva interacción o bitácora de llamada para un miembro */
export const createMemberInteraction = async (campaignId: string, memberId: string, notes: string, type: string, sellerId: string): Promise<any> => {
  const res = await (api.campaigns as any)[UUID_PATH].members[`:${memberId}/interactions` as any].$post({
    param: { campaignId, memberId },
    json: { notes, type },
    headers: { "x-seller-id": sellerId }
  });
  return await res.json();
};

/** GET: Obtiene las tareas y recordatorios pendientes de un miembro de campaña */
export const getMemberTasks = async (campaignId: string, memberId: string): Promise<any> => {
  const res = await (api.campaigns as any)[UUID_PATH].members[`:${memberId}/tasks` as any].$get({
    param: { campaignId, memberId }
  });
  return await res.json();
};

/** POST: Crea un nuevo recordatorio o tarea para el miembro de campaña */
export const createMemberTask = async (campaignId: string, memberId: string, taskData: any, sellerId: string): Promise<any> => {
  const res = await (api.campaigns as any)[UUID_PATH].members[`:${memberId}/tasks` as any].$post({
    param: { campaignId, memberId },
    json: taskData,
    headers: { "x-seller-id": sellerId }
  });
  return await res.json();
};

/** PATCH: Actualiza o marca como completada una tarea específica */
export const updateMemberTask = async (campaignId: string, memberId: string, taskId: string, taskData: any): Promise<any> => {
  const res = await (api.campaigns as any)[UUID_PATH].members[`:${memberId}/tasks/:${taskId}` as any].$patch({
    param: { campaignId, memberId, taskId },
    json: taskData
  });
  return await res.json();
};

/** DELETE: Elimina una tarea o recordatorio del sistema */
export const deleteMemberTask = async (campaignId: string, memberId: string, taskId: string): Promise<any> => {
  const res = await (api.campaigns as any)[UUID_PATH].members[`:${memberId}/tasks/:${taskId}` as any].$delete({
    param: { campaignId, memberId, taskId }
  });
  return await res.json();
};