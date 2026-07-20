export const LEAD_STATUSES = [
  "NEW", "ATTEMPTED_CONTACT", "CONTACTED", "QUALIFIED", "UNQUALIFIED",
  "FOLLOW_UP", "ON_HOLD", "WON", "LOST",
] as const;

export const LEAD_SOURCES = [
  "FACEBOOK", "INSTAGRAM", "TIKTOK", "WHATSAPP", "WEBSITE",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
export type LeadSource = (typeof LEAD_SOURCES)[number];

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
  name: string;
  platform: string;
  status: string;
  initialBudget: number;
  isOrganic: boolean;
  startDate: string | null;
  endDate: string | null;
  assignedLeads: number;
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
  completedOrders: number;
  canceledOrders: number;
  returnRate: number;
  responseTimeAvgSeconds: number;
  campaignMembers: CleanCampaignMember[];
  recentLeadActivity: CleanCampaignMember[];
  campaigns: CleanAssignedCampaign[];
  leadStatusCounts: Record<LeadStatus, number>;
  leadSourceCounts: Record<LeadSource, number>;
  conversionRate: number;
  goalCompletion: number;
  activeCampaigns: number;
}

interface RawSellerProfile {
  id?: string | null;
  user_id?: string | null;
  sales_target?: number | string | null;
  total_sales?: number | string | null;
  total_orders?: number | string | null;
  completed_orders?: number | string | null;
  canceled_orders?: number | string | null;
  return_rate?: number | string | null;
  response_time_avg?: number | string | null;
  user?: {
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    corporate_email?: string | null;
    cellphone?: string | null;
    corporate_cellphone?: string | null;
    is_active?: boolean | null;
  } | null;
  campaignMembers?: Array<{
    id?: string | null;
    lead_id?: string | null;
    campaing_id?: string | null;
    status?: string | null;
    source?: string | null;
    created_at?: string | Date | null;
    updated_at?: string | Date | null;
  }> | null;
}

interface RawCampaignsResponse {
  assignedCampaing?: Array<{
    campaign?: {
      id?: string | null;
      name?: string | null;
      initial_budget?: number | string | null;
      status?: string | null;
      start_date?: string | Date | null;
      end_date?: string | Date | null;
      platform?: string | null;
      is_organic?: boolean | null;
    } | null;
  }> | null;
}

const toNumber = (value: number | string | null | undefined): number => {
  const parsed = typeof value === "string" ? Number.parseFloat(value) : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

const createZeroCounts = <T extends readonly string[]>(values: T) =>
  Object.fromEntries(values.map((value) => [value, 0])) as Record<T[number], number>;

const countKnownValues = <T extends readonly string[]>(
  values: T,
  currentValues: string[],
): Record<T[number], number> => {
  const counts = createZeroCounts(values);
  currentValues.forEach((value) => {
    if (value in counts) counts[value as T[number]] += 1;
  });
  return counts;
};

const toIsoString = (value: string | Date | null | undefined): string | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const getTimestamp = (value: string | null): number => {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export function adaptSellerProfile(
  rawSellerData: unknown,
  rawCampaignsData?: unknown,
): CleanSellerProfile {
  const rawSeller = (rawSellerData ?? {}) as RawSellerProfile;
  const rawCampaigns = (rawCampaignsData ?? {}) as RawCampaignsResponse;
  const user = rawSeller.user ?? {};

  const campaignMembers: CleanCampaignMember[] = (rawSeller.campaignMembers ?? []).map(
    (member) => ({
      id: member.id ?? "",
      leadId: member.lead_id ?? "",
      campaignId: member.campaing_id ?? "",
      status: member.status ?? "",
      source: member.source ?? "",
      createdAt: toIsoString(member.created_at),
      updatedAt: toIsoString(member.updated_at),
    }),
  );

  const campaigns: CleanAssignedCampaign[] = (rawCampaigns.assignedCampaing ?? [])
    .map((assignment) => assignment.campaign)
    .filter((campaign): campaign is NonNullable<typeof campaign> => Boolean(campaign?.id))
    .map((campaign) => ({
      id: campaign.id ?? "",
      name: campaign.name?.trim() || "Sin información",
      platform: campaign.platform?.trim() || "No disponible",
      status: campaign.status?.trim() || "No disponible",
      initialBudget: toNumber(campaign.initial_budget),
      isOrganic: campaign.is_organic ?? false,
      startDate: toIsoString(campaign.start_date),
      endDate: toIsoString(campaign.end_date),
      assignedLeads: campaignMembers.filter((member) => member.campaignId === campaign.id).length,
    }));

  const nameParts = [user.first_name, user.middle_name, user.last_name]
    .map((name) => name?.trim())
    .filter((name): name is string => Boolean(name));
  const fullName = nameParts.join(" ") || "Asesor de ventas";
  const salesTarget = Math.trunc(toNumber(rawSeller.sales_target));
  const totalSales = Math.trunc(toNumber(rawSeller.total_sales));
  const leadStatusCounts = countKnownValues(
    LEAD_STATUSES,
    campaignMembers.map((member) => member.status),
  );
  const totalLeads = campaignMembers.length;

  return {
    id: rawSeller.id ?? "",
    userId: rawSeller.user_id ?? "",
    fullName,
    initials: nameParts.slice(0, 2).map((name) => name[0]).join("").toUpperCase() || "AV",
    email: user.corporate_email?.trim() || user.email?.trim() || "Sin información",
    phone: user.corporate_cellphone?.trim() || user.cellphone?.trim() || null,
    isActive: user.is_active ?? false,
    salesTarget,
    totalSales,
    totalOrders: Math.trunc(toNumber(rawSeller.total_orders)),
    completedOrders: Math.trunc(toNumber(rawSeller.completed_orders)),
    canceledOrders: Math.trunc(toNumber(rawSeller.canceled_orders)),
    returnRate: toNumber(rawSeller.return_rate),
    responseTimeAvgSeconds: toNumber(rawSeller.response_time_avg),
    campaignMembers,
    recentLeadActivity: [...campaignMembers]
      .sort((a, b) => getTimestamp(b.updatedAt ?? b.createdAt) - getTimestamp(a.updatedAt ?? a.createdAt))
      .slice(0, 5),
    campaigns,
    leadStatusCounts,
    leadSourceCounts: countKnownValues(
      LEAD_SOURCES,
      campaignMembers.map((member) => member.source),
    ),
    conversionRate: totalLeads > 0 ? (leadStatusCounts.WON / totalLeads) * 100 : 0,
    goalCompletion: salesTarget > 0 ? (totalSales / salesTarget) * 100 : 0,
    activeCampaigns: campaigns.filter((campaign) => campaign.status === "ACTIVE").length,
  };
}
