import { api } from "@/core/lib/api";
import { LeadStatus } from "@repo/database";
import {LeadStatusSchema} from "shared"
import { InferRequestType } from "hono/client";
import z from "zod";

// 1. Constante exacta del backend (Regex UUID)
const UUID_PATH =
  ":id{[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}}" as const;

// ==========================================
// TIPOS INFERIDOS (Sincronizados con el Backend)
// ==========================================

// Leads
export type GetAllLeadsRes = Awaited<ReturnType<typeof api.leads.$get>>;
export type PaginatedLeads = Awaited<
  ReturnType<GetAllLeadsRes["json"]>
>["data"];

// export type GetLeadByIdRes = InferResponseType<(typeof api.leads)[typeof UUID_PATH]["$get"]>;
// export type CreateLeadReq = InferRequestType<typeof api.leads.$post>["json"];
// export type UpdateLeadReq = InferRequestType<(typeof api.leads)[typeof UUID_PATH]["$put"]>["json"];
// export type DeleteLeadRes = InferResponseType<(typeof api.leads)[typeof UUID_PATH]["$delete"]>;

// Interacciones (Ruta: /leads/:id/interactions)
// Nota: Accedemos a la propiedad ["interactions"] que cuelga del ID
// export type GetLeadInteractionsRes = InferResponseType<
//   (typeof api.leads)[typeof UUID_PATH]["interactions"]["$get"]
// >;

// Creación Manual de Interacciones (Ruta: /leads/interactions)
// export type CreateInteractionReq = InferRequestType<typeof api.leads.interactions.$post>["json"];
// export type CreateInteractionRes = InferResponseType<typeof api.leads.interactions.$post>;

// // Creación Externa (Ruta: /leads/external)
// export type CreateLeadExternalReq = InferRequestType<typeof api.leads.external.$post>["json"];

// ==========================================
// SERVICIOS: LEADS
// ==========================================
export interface filterLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus
}

export const getAllLeads = async (
  params?: filterLeadsParams,
): Promise<PaginatedLeads> => {
  const parsedParams = z
    .object({
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
      search: z.string().optional().default(""),
      status: z.enum(["ACTIVE", "INACTIVE"])
    })
    .parse(params);

  const res = await api.leads.$get({
    query: {
      limit: parsedParams.limit.toString(),
      page: parsedParams.page.toString(),
      search: parsedParams.search.toString(),
      status: parsedParams.status.toString() as LeadStatus
    },
  });
  console.log(res);
  return (await res.json()).data;
};

// export const getLeadById = async (id: string): Promise<GetLeadByIdRes> => {
//   const res = await (api.leads as any)[UUID_PATH].$get({ param: { id } });
//   return await res.json();
// };

// export const createLead = async (data: CreateLeadReq) => {
//   const res = await api.leads.$post({ json: data });
//   return await res.json();
// };

// export const updateLead = async (id: string, data: UpdateLeadReq) => {
//   const res = await (api.leads as any)[UUID_PATH].$put({
//     param: { id },
//     json: data
//   });
//   return await res.json();
// };

// export const deleteLead = async (id: string): Promise<DeleteLeadRes> => {
//   const res = await (api.leads as any)[UUID_PATH].$delete({ param: { id } });
//   return await res.json();
// };

// // ==========================================
// // SERVICIOS: INTERACCIONES & EXTERNAL
// // ==========================================

// /** Obtiene interacciones de un Lead específico */
// export const getLeadInteractions = async (id: string): Promise<GetLeadInteractionsRes> => {
//   // Aquí usamos "as any" para saltar el error de la barra "/" duplicada en el tipo de Hono
//   const res = await (api.leads as any)[UUID_PATH].interactions.$get({ param: { id } });
//   return await res.json();
// };

// /** Registra una interacción manualmente desde el CRM */
// export const createInteraction = async (data: CreateInteractionReq): Promise<CreateInteractionRes> => {
//   const res = await api.leads.interactions.$post({ json: data });
//   return await res.json();
// };

// /** Crea un lead desde una fuente externa (Meta, Web, etc) */
// export const createLeadExternal = async (data: CreateLeadExternalReq) => {
//   const res = await api.leads.external.$post({ json: data });
//   return await res.json();
// };
