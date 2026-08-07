export const LEAD_STATUSES = [
  "NUEVO", "CONTACTADO", "NO_CONTACTADO", "NEGOCIACION",
  "SEGUIMIENTO", "EN_ESPERA", "MATRICULADO", "PERDIDO",
] as const;

export const LEAD_SOURCES = [
  "FACEBOOK", "INSTAGRAM", "TIKTOK", "WHATSAPP", "WEBSITE",
] as const;

export type LeadStatusKey = (typeof LEAD_STATUSES)[number];
export type LeadStatus = string;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NUEVO: "Nuevo",
  NEW: "Nuevo",
  CONTACTADO: "Contactado",
  CONTACTED: "Contactado",
  NO_CONTACTADO: "No contactado",
  ATTEMPTED_CONTACT: "No contactado",
  UNQUALIFIED: "No contactado",
  NEGOCIACION: "Negociación",
  QUALIFIED: "Negociación",
  SEGUIMIENTO: "Seguimiento",
  FOLLOW_UP: "Seguimiento",
  EN_ESPERA: "En espera",
  ON_HOLD: "En espera",
  MATRICULADO: "Matriculado",
  WON: "Matriculado",
  PERDIDO: "Perdido",
  LOST: "Perdido",
};

export interface CleanCampaignMember {
  id: string;
  leadId: string;
  campaignId: string;
  status: string;
  source: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CleanAssignedCampaign {
  id: string;
  campaignId: string;
  name: string;
  platform: string;
  status: string;
  initialBudget: number;
  isOrganic: boolean;
  startDate: string | null;
  endDate: string | null;
  assignedAt: string | null;
  assignedLeads: number;
  totalLeads: number;
  totalMatriculated: number;
  conversionRate: number;
}

export interface LeadStatusBreakdownItem {
  key: string;
  label: string;
  count: number;
}

export interface CleanSellerProfile {
  id: string;
  userId: string;
  fullName: string;
  initials: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  salesTarget: number;
  totalSales: number;
  totalOrders: number;
  totalLeads: number;
  totalMatriculated: number;
  completedOrders: number;
  canceledOrders: number;
  returnRate: number;
  responseTimeAvgSeconds: number;
  campaignMembers: CleanCampaignMember[];
  assignedOrders: Array<{ id: string; status: string; totalAmount: number }>;
  recentLeadActivity: CleanCampaignMember[];
  campaigns: CleanAssignedCampaign[];
  leadStatusCounts: Record<string, number>;
  leadStatusList: LeadStatusBreakdownItem[];
  leadSourceCounts: Record<string, number>;
  conversionRate: number;
  goalCompletion: number;
  activeCampaigns: number;
}

const toNumber = (value: number | string | null | undefined): number => {
  const parsed = typeof value === "string" ? Number.parseFloat(value) : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

const toIsoString = (value: string | Date | null | undefined): string | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export function adaptSellerProfile(
  rawSellerData: unknown,
): CleanSellerProfile {
  let root = (rawSellerData ?? {}) as Record<string, unknown>;
  if (root.data && typeof root.data === "object" && root.data !== null) {
    root = root.data as Record<string, unknown>;
  }

  // 1. Seller object
  const sellerObj = (root.seller ?? root) as Record<string, unknown>;
  const userObj = (sellerObj.user && typeof sellerObj.user === "object" ? sellerObj.user : sellerObj) as Record<string, unknown>;

  const firstName = (userObj.first_name as string)?.trim() ?? "";
  const middleName = (userObj.middle_name as string)?.trim() ?? "";
  const lastName = (userObj.last_name as string)?.trim() ?? "";
  const nameParts = [firstName, middleName, lastName].filter(Boolean);
  const fullName = nameParts.join(" ") || "Asesor de ventas";

  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "AV";

  const email = (userObj.corporate_email as string)?.trim()
    || (userObj.email as string)?.trim()
    || "Sin información";

  const phone = (userObj.corporate_cellphone as string)?.trim()
    || (userObj.cellphone as string)?.trim()
    || null;

  const isActive = userObj.is_active === true;
  const id = (sellerObj.id as string) || (userObj.id as string) || "";
  const userId = (sellerObj.user_id as string) || (userObj.id as string) || id;

  // 2. Metrics object (strictly from data.metrics)
  const metricsObj = (root.metrics ?? sellerObj.metrics ?? {}) as Record<string, unknown>;

  const salesTarget = Math.trunc(toNumber(metricsObj.sales_target));
  const totalSales = Math.trunc(toNumber(metricsObj.total_sales));
  const totalLeads = Math.trunc(toNumber(metricsObj.total_leads));
  const totalMatriculated = Math.trunc(toNumber(metricsObj.total_matriculated));
  const conversionRate = toNumber(metricsObj.conversion_rate);
  const totalOrders = Math.trunc(toNumber(metricsObj.total_orders));
  const activeCampaigns = Math.trunc(toNumber(metricsObj.active_campaigns));
  const goalCompletion = salesTarget > 0 ? (totalSales / salesTarget) * 100 : 0;

  // 3. Lead Status Breakdown (strictly from data.lead_status_breakdown)
  const rawBreakdown = (root.lead_status_breakdown ?? sellerObj.lead_status_breakdown ?? {}) as Record<string, unknown>;

  const leadStatusCounts: Record<string, number> = {};
  const leadStatusList: LeadStatusBreakdownItem[] = [];

  if (typeof rawBreakdown === "object" && rawBreakdown !== null) {
    if (Array.isArray(rawBreakdown)) {
      rawBreakdown.forEach((item: unknown) => {
        if (item && typeof item === "object") {
          const rec = item as Record<string, unknown>;
          const k = String(rec.status || "").toUpperCase();
          const count = Math.trunc(toNumber(rec.count));
          if (k) {
            leadStatusCounts[k] = count;
            leadStatusList.push({
              key: k,
              label: LEAD_STATUS_LABELS[k] ?? k,
              count,
            });
          }
        }
      });
    } else {
      Object.entries(rawBreakdown).forEach(([k, val]) => {
        const keyUpper = k.toUpperCase();
        const count = Math.trunc(toNumber(val));
        leadStatusCounts[keyUpper] = count;
        leadStatusList.push({
          key: keyUpper,
          label: LEAD_STATUS_LABELS[keyUpper] ?? keyUpper,
          count,
        });
      });
    }
  }

  // Ensure standard breakdown list entries exist
  const defaultKeys = ["NUEVO", "CONTACTADO", "NO_CONTACTADO", "NEGOCIACION", "SEGUIMIENTO", "EN_ESPERA", "MATRICULADO", "PERDIDO"];
  defaultKeys.forEach((key) => {
    if (!(key in leadStatusCounts)) {
      const aliasMap: Record<string, string> = {
        NUEVO: "NEW",
        CONTACTADO: "CONTACTED",
        NO_CONTACTADO: "ATTEMPTED_CONTACT",
        NEGOCIACION: "QUALIFIED",
        SEGUIMIENTO: "FOLLOW_UP",
        EN_ESPERA: "ON_HOLD",
        MATRICULADO: "WON",
        PERDIDO: "LOST",
      };
      const alias = aliasMap[key];
      const aliasCount = alias && alias in leadStatusCounts ? leadStatusCounts[alias] : 0;
      leadStatusCounts[key] = aliasCount;
      if (!leadStatusList.some((item) => item.key === key)) {
        leadStatusList.push({
          key,
          label: LEAD_STATUS_LABELS[key] ?? key,
          count: aliasCount,
        });
      }
    }
  });

  // 4. Assigned Campaigns (strictly from data.assigned_campaigns)
  const rawCampaignList = (root.assigned_campaigns ?? root.assignedCampaing ?? sellerObj.assigned_campaigns ?? []) as unknown[];

  const campaigns: CleanAssignedCampaign[] = rawCampaignList.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const rec = item as Record<string, unknown>;
    const cObj = (rec.campaign && typeof rec.campaign === "object" ? rec.campaign : rec) as Record<string, unknown>;
    const cMetrics = (rec.metrics && typeof rec.metrics === "object" ? rec.metrics : (cObj.metrics && typeof cObj.metrics === "object" ? cObj.metrics : {})) as Record<string, unknown>;

    const id = (rec.id as string) || (cObj.id as string) || (rec.campaign_id as string) || "";
    if (!id) return [];
    const campaignId = (rec.campaign_id as string) || (cObj.id as string) || id;
    const name = (cObj.name as string)?.trim() || (rec.name as string)?.trim() || "Campaña sin nombre";
    const platform = (cObj.platform as string)?.trim() || "No disponible";
    const status = (cObj.status as string)?.trim() || (rec.status as string)?.trim() || "ACTIVE";
    const assignedAt = toIsoString((rec.assigned_at as string | Date) || (rec.created_at as string | Date) || (cObj.start_date as string | Date));

    // Read strictly from campaign.metrics!
    const cLeads = Math.trunc(toNumber(cMetrics.total_leads));
    const cMatriculated = Math.trunc(toNumber(cMetrics.total_matriculated));
    const cConversion = typeof cMetrics.conversion_rate === "number"
      ? cMetrics.conversion_rate
      : (cLeads > 0 ? (cMatriculated / cLeads) * 100 : 0);

    return [{
      id,
      campaignId,
      name,
      platform,
      status,
      initialBudget: 0,
      isOrganic: false,
      startDate: assignedAt,
      endDate: null,
      assignedAt,
      assignedLeads: cLeads,
      totalLeads: cLeads,
      totalMatriculated: cMatriculated,
      conversionRate: cConversion,
    }];
  });

  return {
    id,
    userId,
    fullName,
    initials,
    email,
    phone,
    isActive,
    salesTarget,
    totalSales,
    totalOrders,
    totalLeads,
    totalMatriculated,
    completedOrders: 0,
    canceledOrders: 0,
    returnRate: 0,
    responseTimeAvgSeconds: 0,
    campaignMembers: [],
    assignedOrders: [],
    recentLeadActivity: [],
    campaigns,
    leadStatusCounts,
    leadStatusList,
    leadSourceCounts: {},
    conversionRate,
    goalCompletion,
    activeCampaigns: activeCampaigns || campaigns.filter((c) => c.status === "ACTIVE").length,
  };
}

// ---------------------------------------------------------------------------
// SellerTeamCardModel — normalised shape for the team overview cards
// ---------------------------------------------------------------------------

export interface SellerTeamCardModel {
  sellerProfileId: string;
  userId: string;
  fullName: string;
  initials: string;
  isActive: boolean;
  totalLeads: number;
  totalMatriculated: number;
  totalOrders: number;
  activeCampaigns: number;
  salesTarget: number;
  corporateEmail: string | null;
}

interface RawTeamSeller {
  id?: string | null;
  user_id?: string | null;
  sales_target?: number | string | null;
  total_orders?: number | string | null;
  user?: {
    first_name?: string | null;
    last_name?: string | null;
    corporate_email?: string | null;
    email?: string | null;
    is_active?: boolean | null;
  } | null;
  assignedCampaing?: Array<{
    campaign_id?: string | null;
    campaign?: {
      id?: string | null;
      name?: string | null;
      status?: string | null;
    } | null;
  }> | null;
  metrics?: {
    total_leads?: number | null;
    total_matriculated?: number | null;
  } | null;
}

export function adaptSellerTeamCard(raw: unknown): SellerTeamCardModel {
  const seller = (raw ?? {}) as RawTeamSeller;
  const user = seller.user ?? {};

  const firstName = user.first_name?.trim() ?? "";
  const lastName = user.last_name?.trim() ?? "";
  const nameParts = [firstName, lastName].filter(Boolean);
  const fullName = nameParts.join(" ") || "Asesor de ventas";

  const initials = nameParts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "AV";

  const activeCampaigns = (seller.assignedCampaing ?? []).filter(
    (item) => item?.campaign?.status === "ACTIVE",
  ).length;

  return {
    sellerProfileId: typeof seller.id === "string" ? seller.id : "",
    userId: typeof seller.user_id === "string" ? seller.user_id : "",
    fullName,
    initials,
    isActive: user.is_active === true,
    totalLeads: typeof seller.metrics?.total_leads === "number" ? Math.max(0, seller.metrics.total_leads) : 0,
    totalMatriculated: typeof seller.metrics?.total_matriculated === "number" ? Math.max(0, seller.metrics.total_matriculated) : 0,
    totalOrders: toNumber(seller.total_orders),
    activeCampaigns,
    salesTarget: Math.trunc(toNumber(seller.sales_target)),
    corporateEmail: user.corporate_email?.trim() || user.email?.trim() || null,
  };
}

export function adaptSellerTeamList(response: unknown): SellerTeamCardModel[] {
  let items: unknown[] = [];
  if (Array.isArray(response)) {
    items = response;
  } else if (typeof response === "object" && response !== null) {
    const data = Reflect.get(response as object, "data");
    if (Array.isArray(data)) items = data;
  }
  return items.map(adaptSellerTeamCard);
}
