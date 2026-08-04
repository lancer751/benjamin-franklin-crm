import type { LeadPhone, PersonName } from "./leadDetail.types";
import { INTERACTION_TYPE_LABELS } from "../../utils/interactionType.constants";

const labels: Record<string, string> = {
  ...INTERACTION_TYPE_LABELS,
  NOT_SPECIFIED: "No especificado",
  FACEBOOK: "Facebook", INSTAGRAM: "Instagram", TIKTOK: "TikTok", WEBSITE: "Sitio web",
  MANUAL: "Registro manual", MALE: "Masculino", FEMALE: "Femenino",
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
export const principalPhoneFrom = (phones: LeadPhone[]) => phones.find((phone) => phone.isPrincipal || phone.is_principal) ?? phones[0];
export const isValidPhone = (phone?: string | null) => (phone?.replace(/\D/g, "").length ?? 0) >= 7;
