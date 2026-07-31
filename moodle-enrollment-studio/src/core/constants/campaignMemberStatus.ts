export const CAMPAIGN_MEMBER_STATUS_VALUES = [
  "NUEVO",
  "CONTACTADO",
  "NO_CONTACTADO",
  "NEGOCIACION",
  "SEGUIMIENTO",
  "EN_ESPERA",
  "MATRICULADO",
  "PERDIDO",
] as const;

export type CampaignMemberStatus = (typeof CAMPAIGN_MEMBER_STATUS_VALUES)[number];

export const CAMPAIGN_MEMBER_STATUS_GROUPS = {
  CAPTACION: "Captación",
  GESTION_COMERCIAL: "Gestión comercial",
  RESULTADO: "Resultado",
} as const;

export type CampaignMemberStatusGroup = keyof typeof CAMPAIGN_MEMBER_STATUS_GROUPS;

export interface CampaignMemberStatusConfig {
  label: string;
  order: number;
  group: CampaignMemberStatusGroup;
  dotClassName: string;
  badgeClassName: string;
  columnClassName: string;
}

export const CAMPAIGN_MEMBER_STATUS_CONFIG: Record<CampaignMemberStatus, CampaignMemberStatusConfig> = {
  NUEVO: {
    label: "Nuevo",
    order: 1,
    group: "CAPTACION",
    dotClassName: "bg-sky-500",
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300",
    columnClassName: "border-sky-200/80 bg-sky-50/70 text-sky-800 dark:border-sky-900 dark:bg-sky-950/25 dark:text-sky-300",
  },
  CONTACTADO: {
    label: "Contactado",
    order: 2,
    group: "CAPTACION",
    dotClassName: "bg-cyan-500",
    badgeClassName: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-300",
    columnClassName: "border-cyan-200/80 bg-cyan-50/70 text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950/25 dark:text-cyan-300",
  },
  NO_CONTACTADO: {
    label: "No contactado",
    order: 3,
    group: "CAPTACION",
    dotClassName: "bg-violet-500",
    badgeClassName: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-300",
    columnClassName: "border-violet-200/80 bg-violet-50/70 text-violet-800 dark:border-violet-900 dark:bg-violet-950/25 dark:text-violet-300",
  },
  NEGOCIACION: {
    label: "Negociación",
    order: 4,
    group: "GESTION_COMERCIAL",
    dotClassName: "bg-amber-500",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
    columnClassName: "border-amber-200/80 bg-amber-50/70 text-amber-900 dark:border-amber-900 dark:bg-amber-950/25 dark:text-amber-300",
  },
  SEGUIMIENTO: {
    label: "Seguimiento",
    order: 5,
    group: "GESTION_COMERCIAL",
    dotClassName: "bg-orange-500",
    badgeClassName: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-300",
    columnClassName: "border-orange-200/80 bg-orange-50/70 text-orange-800 dark:border-orange-900 dark:bg-orange-950/25 dark:text-orange-300",
  },
  EN_ESPERA: {
    label: "En espera",
    order: 6,
    group: "GESTION_COMERCIAL",
    dotClassName: "bg-slate-500",
    badgeClassName: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
    columnClassName: "border-slate-200 bg-slate-50/80 text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300",
  },
  MATRICULADO: {
    label: "Matriculado",
    order: 7,
    group: "RESULTADO",
    dotClassName: "bg-emerald-500",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
    columnClassName: "border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
  PERDIDO: {
    label: "Perdido",
    order: 8,
    group: "RESULTADO",
    dotClassName: "bg-rose-500",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300",
    columnClassName: "border-rose-200 bg-rose-50/80 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300",
  },
};

export const CAMPAIGN_MEMBER_STATUS_LIST = CAMPAIGN_MEMBER_STATUS_VALUES.map((value) => ({
  value,
  ...CAMPAIGN_MEMBER_STATUS_CONFIG[value],
}));

export type CampaignMemberStatusListItem = (typeof CAMPAIGN_MEMBER_STATUS_LIST)[number];

export const CAMPAIGN_MEMBER_STATUS_OPTIONS = CAMPAIGN_MEMBER_STATUS_VALUES.map((value) => ({
  value,
  label: CAMPAIGN_MEMBER_STATUS_CONFIG[value].label,
}));

export const isCampaignMemberStatus = (value: unknown): value is CampaignMemberStatus =>
  typeof value === "string" && CAMPAIGN_MEMBER_STATUS_VALUES.some((status) => status === value);

export const getCampaignMemberStatusConfig = (status: unknown): CampaignMemberStatusConfig | null =>
  isCampaignMemberStatus(status) ? CAMPAIGN_MEMBER_STATUS_CONFIG[status] : null;

export const getCampaignMemberStatusLabel = (
  status: unknown,
  emptyLabel = "Sin etapa",
): string => {
  if (status === null || status === undefined || status === "") return emptyLabel;
  return getCampaignMemberStatusConfig(status)?.label ?? "Estado desconocido";
};
