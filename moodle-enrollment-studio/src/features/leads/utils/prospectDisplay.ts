export const MEMBER_STATUS_OPTIONS = [
  "NEW",
  "ATTEMPTED_CONTACT",
  "CONTACTED",
  "QUALIFIED",
  "UNQUALIFIED",
  "FOLLOW_UP",
  "ON_HOLD",
  "WON",
  "LOST",
] as const;

export const MEMBER_STATUS_LABELS: Record<string, string> = {
  NEW: "Nuevo",
  ATTEMPTED_CONTACT: "Intento de contacto",
  CONTACTED: "Contactado",
  QUALIFIED: "Calificado",
  UNQUALIFIED: "No calificado",
  FOLLOW_UP: "Seguimiento",
  ON_HOLD: "En espera",
  WON: "Ganado",
  LOST: "Perdido",
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

export const LEAD_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Activo" },
  { value: "INACTIVE", label: "Inactivo" },
] as const;

export const PLATFORM_LABELS: Record<string, string> = {
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  WHATSAPP: "WhatsApp",
  WEBSITE: "Web",
};

export const formatProspectDate = (value: string): string => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const getMemberStatusLabel = (status: string): string => {
  if (!status) return "Sin etapa";
  return MEMBER_STATUS_LABELS[status] || status.replace(/_/g, " ").toLocaleLowerCase("es");
};

export const getPlatformLabel = (platform: string): string => (
  PLATFORM_LABELS[platform] || platform.replace(/_/g, " ")
);

export const getMemberStatusTone = (status: string): string => {
  if (status === "WON" || status === "QUALIFIED") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "LOST" || status === "UNQUALIFIED") return "border-rose-200 bg-rose-50 text-rose-700";
  if (status === "FOLLOW_UP" || status === "ON_HOLD") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
};
