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

export interface LeadListQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
  lead_status?: "ACTIVE" | "INACTIVE";
  member_status?: string;
  assigned_to?: string;
  campaign_id?: string;
  created_from?: string;
  created_to?: string;
}

export interface LeadLookupResponse {
  success: boolean;
  code?: "LEAD_IDENTITY_CONFLICT";
  message?: string;
  data?: {
    found: boolean;
    matchedBy: "phone" | "email" | "phone_and_email" | null;
    campaign_member_id: string | null;
    lead: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      email: string | null;
      phones: Array<{
        number: string;
        type: string;
        isPrincipal: boolean;
      }>;
    } | null;
  };
}

// 2. Rutas de Miembros de Campaña (/api/campaigns/:campaignId/members)
// Para acceder a los métodos anidados del sub-router usamos casting limpio o invocación directa por convención RPC
export type GetCampaignMembersRes = InferResponseType<typeof api.campaigns[typeof UUID_PATH]["members"]["$get"]>;
export type CreateCampaignMemberReq = InferRequestType<typeof api.campaigns[":campaignId"]["members"]["$post"]>["json"];
export type UpdateMemberStatusReq = InferRequestType<typeof api.campaigns[typeof UUID_PATH]["members支撑" /* Fallback seguro para strings string */]["$patch"]>["json"];

// ==========================================
// SERVICIOS: LEADS
// ==========================================

/** Obtiene la lista unificada y paginada de todos los leads */
export const getAllLeads = async (query?: LeadListQuery): Promise<GetAllLeadsRes> => {
  const cleanQuery = (query && !("queryKey" in query)) ? query : undefined;
  const res = await api.leads.$get(cleanQuery ? { query: cleanQuery as any } : undefined);
  return await res.json();
};

/** Obtiene el perfil detallado de un lead por su UUID */
export const getLeadById = async (id: string): Promise<GetLeadByIdRes> => {
  const res = await (api.leads as any)[UUID_PATH].$get({ param: { id } });
  return await res.json();
};

/** Registra un nuevo lead base (con sus respectivos teléfonos) */
export const createLead = async (data: CreateLeadReq, sellerId?: string): Promise<InferResponseType<typeof api.leads.$post>> => {
  const headers: Record<string, string> = {};
  if (sellerId) {
    headers["x-seller-id"] = sellerId;
  }
  const res = await api.leads.$post({ json: data } as any, { headers });
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

/** Retira un lead de las vistas activas mediante el soft delete del backend. */
export const deleteLead = async (id: string): Promise<unknown> => {
  const res = await api.leads[UUID_PATH].$delete({ param: { id } });
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
export const addLeadToCampaign = async (campaignId: string, data: CreateCampaignMemberReq, sellerId?: string): Promise<any> => {
  // Si usas el cliente indexado por RPC de Hono, el objeto 'param' debe mapear 'campaignId'
  const headers: Record<string, string> = {};
  if (sellerId) {
    headers["x-seller-id"] = sellerId;
  }
  const res = await api.campaigns[":campaignId"].members.$post({
    param: { campaignId }, 
    json: data
  } as any, { headers });
  return await res.json();
};

/** PATCH: Actualiza el estado de tipificación comercial de un miembro (:memberId/status) */
export const updateMemberStatus = async (campaignId: string, memberId: string, status: string): Promise<any> => {
  const res = await (api.campaigns as any)[":campaignId"].members[":memberId"].status.$patch({
    param: { campaignId, memberId },
    json: { status }
  });
  return await res.json();
};

/** PATCH: Reasigna el prospecto de la campaña a otro asesor comercial (:memberId/reassign) */
export const reassignMember = async (campaignId: string, memberId: string, assignedTo: string): Promise<any> => {
  const res = await (api.campaigns as any)[":campaignId"].members[":memberId"].reassign.$patch({
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
  const res = await (api.campaigns as any)[":campaignId"].members[":memberId"].interactions.$get({
    param: { campaignId, memberId }
  });
  return await res.json();
};

/** POST: Registra una nueva interacción o bitácora de llamada para un miembro */
export const createMemberInteraction = async (campaignId: string, memberId: string, notes: string, type: string, sellerId: string): Promise<unknown> => {
  const res = await (api.campaigns as any)[":campaignId"].members[":memberId"].interactions.$post({
    param: { campaignId, memberId },
    json: { notes, type },
    headers: { "x-seller-id": sellerId }
  } as any, {
    headers: { "x-seller-id": sellerId }
  });
  return await res.json();
};

/** GET: Obtiene las tareas y recordatorios pendientes de un miembro de campaña */
export const getMemberTasks = async (campaignId: string, memberId: string): Promise<any> => {
  const res = await (api.campaigns as any)[":campaignId"].members[":memberId"].tasks.$get({
    param: { campaignId, memberId }
  });
  return await res.json();
};

/** POST: Crea un nuevo recordatorio o tarea para el miembro de campaña */
export interface MemberTaskPayload {
  title: string;
  content: string;
  is_done: boolean;
  due_date?: string | null;
}

export type MemberTaskUpdatePayload = Partial<MemberTaskPayload>;

export const createMemberTask = async (campaignId: string, memberId: string, taskData: MemberTaskPayload, sellerId: string): Promise<unknown> => {
  const res = await (api.campaigns as any)[":campaignId"].members[":memberId"].tasks.$post({
    param: { campaignId, memberId },
    json: taskData,
    headers: { "x-seller-id": sellerId }
  } as any, {
    headers: { "x-seller-id": sellerId }
  });
  return await res.json();
};

/** PATCH: Actualiza o marca como completada una tarea específica */
export const updateMemberTask = async (campaignId: string, memberId: string, taskId: string, taskData: MemberTaskUpdatePayload): Promise<unknown> => {
  const res = await (api.campaigns as any)[":campaignId"].members[":memberId"].tasks[":taskId"].$patch({
    param: { campaignId, memberId, taskId },
    json: taskData
  });
  return await res.json();
};

/** DELETE: Elimina una tarea o recordatorio del sistema */
export const deleteMemberTask = async (campaignId: string, memberId: string, taskId: string): Promise<unknown> => {
  const res = await (api.campaigns as any)[":campaignId"].members[":memberId"].tasks[":taskId"].$delete({
    param: { campaignId, memberId, taskId }
  });
  return await res.json();
};

export const lookupLeadExact = async (query: {
  phone?: string;
  email?: string;
  campaignId: string;
  sellerId: string;
}): Promise<LeadLookupResponse> => {
  const res = await (api.leads as any).lookup.$get({
    query: {
      ...(query.phone && { phone: query.phone }),
      ...(query.email && { email: query.email }),
      campaign_id: query.campaignId,
      seller_id: query.sellerId,
    },
  });
  const body = await res.json() as LeadLookupResponse & { error?: string };
  if (!res.ok && body.code !== "LEAD_IDENTITY_CONFLICT") {
    throw new Error(body.message || body.error || "No fue posible buscar el prospecto.");
  }
  return body;
};
