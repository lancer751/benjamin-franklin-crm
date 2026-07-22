import type { LeadCampaignMember, LeadPhone, PersonName } from "./leadDetail.types";

const labels: Record<string, string> = {
  ACTIVE: "Activo", INACTIVE: "Inactivo", NOT_SPECIFIED: "No especificado",
  NEW: "Nuevo", ATTEMPTED_CONTACT: "No contactado", CONTACTED: "Contactado",
  QUALIFIED: "Preventa - Cita", APPOINTMENT: "Preventa - Cita", FOLLOW_UP: "Seguimiento",
  ON_HOLD: "En espera", WON: "Matriculado", ENROLLED: "Matriculado",
  LOST: "Descartado", UNQUALIFIED: "Descartado", DISCARDED: "Descartado",
  FACEBOOK: "Facebook", INSTAGRAM: "Instagram", TIKTOK: "TikTok", WEBSITE: "Sitio web",
  WHATSAPP: "WhatsApp", MANUAL: "Registro manual", CALL: "Llamada", MEETING: "Reunión",
  EMAIL: "Correo", SELL: "Venta", MALE: "Masculino", FEMALE: "Femenino",
};

export const displayValue = (value?: string | null) => value?.trim() || "No especificado";
export const displayEnum = (value?: string | null) => {
  if (!value) return "No especificado";
  return labels[value] ?? value.toLocaleLowerCase("es").replace(/_/g, " ").replace(/^./, (character) => character.toLocaleUpperCase("es"));
};
export const personFullName = (person?: PersonName | null) => [person?.first_name, person?.middle_name, person?.last_name].filter(Boolean).join(" ");
export const initialsFor = (person?: PersonName | null) => {
  const names = [person?.first_name, person?.last_name].filter(Boolean) as string[];
  return names.map((name) => name[0]).join("").toUpperCase() || "P";
};
export const formatLeadDate = (value?: string | null, withTime = false) => {
  if (!value) return "No especificado";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No especificado";
  return new Intl.DateTimeFormat("es-PE", withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "medium" }).format(date);
};
export const campaignFor = (member?: LeadCampaignMember | null) => member?.campaing ?? member?.campaign ?? null;
export const campaignIdFor = (member?: LeadCampaignMember | null) => campaignFor(member)?.id ?? member?.campaing_id ?? member?.campaign_id ?? "";
export const sellerNameFor = (member?: LeadCampaignMember | null) => personFullName(member?.seller?.user) || "Sin asignar";
export const principalPhoneFrom = (phones: LeadPhone[]) => phones.find((phone) => phone.isPrincipal || phone.is_principal) ?? phones[0];
export const isValidPhone = (phone?: string | null) => (phone?.replace(/\D/g, "").length ?? 0) >= 7;
