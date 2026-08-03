import type { LeadSource, LeadStatus } from "../../adapters/seller.adapter";

const integerFormatter = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 0 });

const percentageFormatter = new Intl.NumberFormat("es-PE", { maximumFractionDigits: 1 });

const currencyFormatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export const formatInteger = (value: number) => integerFormatter.format(value);
export const formatPercentage = (value: number) => `${percentageFormatter.format(value)}%`;
export const formatCurrency = (value: number) => currencyFormatter.format(value);

export const formatDate = (value: string | null, fallback = "No registrado") => {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : dateFormatter.format(date);
};

export const formatDuration = (totalSeconds: number) => {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
  }
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes} min ${remainingSeconds} s` : `${minutes} min`;
  }
  return `${seconds} s`;
};

export const leadStatusLabels: Record<LeadStatus, string> = {
  NEW: "Nuevo",
  ATTEMPTED_CONTACT: "Contacto intentado",
  CONTACTED: "Contactado",
  QUALIFIED: "Calificado",
  UNQUALIFIED: "No calificado",
  FOLLOW_UP: "Seguimiento",
  ON_HOLD: "En espera",
  WON: "Ganado",
  LOST: "Perdido",
};

export const leadSourceLabels: Record<LeadSource, string> = {
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  WHATSAPP: "WhatsApp",
  WEBSITE: "Sitio web",
};

export const getStatusLabel = (status: string) =>
  leadStatusLabels[status as LeadStatus] ?? "No disponible";

export const getSourceLabel = (source: string) =>
  leadSourceLabels[source as LeadSource] ?? "No disponible";
