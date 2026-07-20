/**
 * Diccionarios de Mapeo (Mapping Dictionaries)
 * Se utilizan para traducir los Enums del Backend (inglés) a la UI (español)
 * sin alterar el valor subyacente que se envía/recibe de la API.
 */

export const EditionStatusMap: Record<string, string> = {
    DRAFT: "Borrador",
    SCHEDULED: "Programado",
    OPEN: "Inscripciones Abiertas",
    IN_PROGRESS: "En Progreso",
    COMPLETED: "Completado",
    CANCELLED: "Cancelado",
};

export const DayOfWeekMap: Record<string, string> = {
    MONDAY: "Lunes",
    TUESDAY: "Martes",
    WEDNESDAY: "Miércoles",
    THURSDAY: "Jueves",
    FRIDAY: "Viernes",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
};

export const DurationUnitMap: Record<string, string> = {
    WEEKS: "Semanas",
    MONTHS: "Meses",
};

export const ModalityMap: Record<string, string> = {
    PRESENCIAL: "Presencial",
    VIRTUAL: "Virtual",
    HIBRIDO: "Híbrido",
    ASINCRONICO: "Asincrónico",
};

export const RoleTranslationsMap: Record<string, string> = {
    ADMIN: "Administrador",
    MARKETING: "Marketing",
    SALES_SUPERVISOR: "Supervisor de Ventas",
    SALES_REP: "Asesor de Ventas",
    COLLECTIONS: "Cobranzas",
};

export const CampaignStatusMap: Record<string, string> = {
    ACTIVE: "Activa",
    INACTIVE: "Inactiva",
    PAUSED: "Pausada",
};

export const CampaignPlatformMap: Record<string, string> = {
    FACEBOOK: "Facebook Ads",
    INSTAGRAM: "Instagram",
    TIKTOK: "TikTok Ads",
    WEBSITE: "Sitio Web",
};

export const CAMPAIGN_MEMBER_STATUS_OPTIONS = [
    { value: "NEW", label: "Nuevo" },
    { value: "ATTEMPTED_CONTACT", label: "Intento de contacto" },
    { value: "CONTACTED", label: "Contactado" },
    { value: "QUALIFIED", label: "Calificado" },
    { value: "FOLLOW_UP", label: "Seguimiento" },
    { value: "ON_HOLD", label: "En espera" },
    { value: "WON", label: "Matriculado" },
    { value: "LOST", label: "Descartado" },
] as const;

export type CampaignMemberStatus = (typeof CAMPAIGN_MEMBER_STATUS_OPTIONS)[number]["value"];

export const CampaignMemberStatusMap: Record<CampaignMemberStatus, string> =
    Object.fromEntries(
        CAMPAIGN_MEMBER_STATUS_OPTIONS.map(({ value, label }) => [value, label])
    ) as Record<CampaignMemberStatus, string>;

export const getCampaignMemberStatusLabel = (status: string): string =>
    CampaignMemberStatusMap[status as CampaignMemberStatus] || status || "No especificado";

export const ProductSalesStatusMap: Record<string, string> = {
    DRAFT: "Borrador",
    PUBLISHED: "Publicado",
    ON_SALE: "En Venta",
    COMPLETED: "Completado",
    CANCELLED: "Cancelado"
};

/**
 * Función helper para traducir un Enum de forma segura.
 * Si el valor no existe en el diccionario, retorna el valor original (fallback).
 * * @param value - El string crudo desde el backend (ej. "WEEKS")
 * @param dictionary - El objeto Record a utilizar para mapear
 * @returns El string traducido o el valor por defecto
 */
export const translateEnum = (
    value: string | null | undefined,
    dictionary: Record<string, string>
): string => {
    if (!value) return "No especificado";
    return dictionary[value] || value;
};

