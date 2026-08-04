export const LEAD_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Activo" },
  { value: "INACTIVE", label: "Inactivo" },
] as const;

export type LeadStatus = (typeof LEAD_STATUS_OPTIONS)[number]["value"];

export const LEAD_STATUS_VALUES = LEAD_STATUS_OPTIONS.map((option) => option.value) as [
  LeadStatus,
  ...LeadStatus[],
];

export const isLeadStatus = (value: unknown): value is LeadStatus => (
  LEAD_STATUS_VALUES.some((status) => status === value)
);

export const getLeadStatusLabel = (status?: string | null): string => (
  LEAD_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? "No especificado"
);

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

export const getPlatformLabel = (platform: string): string => (
  PLATFORM_LABELS[platform] || platform.replace(/_/g, " ")
);
