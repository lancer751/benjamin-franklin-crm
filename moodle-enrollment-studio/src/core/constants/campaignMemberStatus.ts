export const CAMPAIGN_MEMBER_STATUS_GROUPS = {
  CAPTACION: "Captación",
  GESTION_COMERCIAL: "Gestión comercial",
  RESULTADO: "Resultado",
} as const;

export type CampaignMemberStatusGroup = keyof typeof CAMPAIGN_MEMBER_STATUS_GROUPS;

export const CAMPAIGN_MEMBER_STATUS_CONFIG = [
  {
    value: "NUEVO",
    label: "Nuevo",
    order: 1,
    group: "CAPTACION",
    dotClassName: "bg-sky-500",
    badgeClassName: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300",
    laneClassName: "border-sky-200/80 bg-sky-50/70 text-sky-800 dark:border-sky-900 dark:bg-sky-950/25 dark:text-sky-300",
  },
  {
    value: "CONTACTADO",
    label: "Contactado",
    order: 2,
    group: "CAPTACION",
    dotClassName: "bg-cyan-500",
    badgeClassName: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-300",
    laneClassName: "border-cyan-200/80 bg-cyan-50/70 text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950/25 dark:text-cyan-300",
  },
  {
    value: "NO_CONTACTADO",
    label: "No contactado",
    order: 3,
    group: "CAPTACION",
    dotClassName: "bg-violet-500",
    badgeClassName: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-300",
    laneClassName: "border-violet-200/80 bg-violet-50/70 text-violet-800 dark:border-violet-900 dark:bg-violet-950/25 dark:text-violet-300",
  },
  {
    value: "NEGOCIACION",
    label: "Negociación",
    order: 4,
    group: "GESTION_COMERCIAL",
    dotClassName: "bg-amber-500",
    badgeClassName: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
    laneClassName: "border-amber-200/80 bg-amber-50/70 text-amber-900 dark:border-amber-900 dark:bg-amber-950/25 dark:text-amber-300",
  },
  {
    value: "SEGUIMIENTO",
    label: "Seguimiento",
    order: 5,
    group: "GESTION_COMERCIAL",
    dotClassName: "bg-orange-500",
    badgeClassName: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-300",
    laneClassName: "border-orange-200/80 bg-orange-50/70 text-orange-800 dark:border-orange-900 dark:bg-orange-950/25 dark:text-orange-300",
  },
  {
    value: "EN_ESPERA",
    label: "En espera",
    order: 6,
    group: "GESTION_COMERCIAL",
    dotClassName: "bg-slate-500",
    badgeClassName: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
    laneClassName: "border-slate-200 bg-slate-50/80 text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300",
  },
  {
    value: "MATRICULADO",
    label: "Matriculado",
    order: 7,
    group: "RESULTADO",
    dotClassName: "bg-emerald-500",
    badgeClassName: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
    laneClassName: "border-emerald-200 bg-emerald-50/80 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
  {
    value: "PERDIDO",
    label: "Perdido",
    order: 8,
    group: "RESULTADO",
    dotClassName: "bg-rose-500",
    badgeClassName: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300",
    laneClassName: "border-rose-200 bg-rose-50/80 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300",
  },
] as const;

export type CampaignMemberStatus = (typeof CAMPAIGN_MEMBER_STATUS_CONFIG)[number]["value"];
export type CampaignMemberStatusConfig = (typeof CAMPAIGN_MEMBER_STATUS_CONFIG)[number];

export const CAMPAIGN_MEMBER_STATUS_OPTIONS = CAMPAIGN_MEMBER_STATUS_CONFIG.map(({ value, label }) => ({ value, label }));

export const CAMPAIGN_MEMBER_STATUS_BY_VALUE = Object.fromEntries(
  CAMPAIGN_MEMBER_STATUS_CONFIG.map((status) => [status.value, status]),
) as Record<CampaignMemberStatus, CampaignMemberStatusConfig>;

export const isCampaignMemberStatus = (value: string | null | undefined): value is CampaignMemberStatus =>
  Boolean(value && value in CAMPAIGN_MEMBER_STATUS_BY_VALUE);

export const getCampaignMemberStatusLabel = (status: string): string =>
  isCampaignMemberStatus(status) ? CAMPAIGN_MEMBER_STATUS_BY_VALUE[status].label : status || "No especificado";
