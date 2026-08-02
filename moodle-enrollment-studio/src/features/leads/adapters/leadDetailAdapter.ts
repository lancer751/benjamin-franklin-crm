import { isCampaignMemberStatus, type CampaignMemberStatus } from "@/core/constants/campaignMemberStatus";
import type { LeadPhone, LeadTask, PersonName } from "../components/lead-detail/leadDetail.types";
import { adaptLeadInteractions, type LeadInteractionViewModel } from "./leadInteractionAdapter";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

export interface AssignedUserViewModel { id: string; name: string }
export interface LeadCampaignViewModel {
  id: string;
  campaignId: string;
  campaignName: string;
  platform: string;
  status: CampaignMemberStatus;
  assignedUser: AssignedUserViewModel | null;
  source: string;
  isPrimary: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  interactions: LeadInteractionViewModel[];
}
export interface LeadDetailViewModel extends PersonName {
  id: string;
  profession: string | null;
  gender: string | null;
  address: string | null;
  second_address: string | null;
  email: string | null;
  secondary_email: string | null;
  dni: string | null;
  lead_status: string | null;
  created_at: string | null;
  updated_at: string | null;
  phones: LeadPhone[];
  campaigns: LeadCampaignViewModel[];
}

export interface CampaignDialogSeller { userId: string; sellerProfileId: string; name: string }
export interface CampaignDialogOption { id: string; name: string; platform: string; sellers: CampaignDialogSeller[] }

type UnknownRecord = Record<string, unknown>;
const isRecord = (value: unknown): value is UnknownRecord => typeof value === "object" && value !== null;
const stringValue = (value: unknown) => typeof value === "string" ? value : "";
const nullableString = (value: unknown): string | null => typeof value === "string" ? value : null;
const normalizedName = (...values: unknown[]) => values.map((value) => stringValue(value).trim().replace(/\s+/g, " ")).filter(Boolean).join(" ");

export const apiMessage = (response: unknown, fallback: string) => getApiErrorMessage(response, fallback);

export const requireSuccess = (response: unknown, fallback: string): UnknownRecord => {
  if (!isRecord(response) || response.success !== true) throw new Error(apiMessage(response, fallback));
  return response;
};

const adaptAssignedUser = (value: unknown): AssignedUserViewModel | null => {
  if (!isRecord(value)) return null;
  const id = stringValue(value.id).trim();
  if (!id) return null;
  return { id, name: normalizedName(value.first_name, value.last_name) || "Usuario no disponible" };
};

const adaptCampaign = (value: unknown): LeadCampaignViewModel | null => {
  if (!isRecord(value)) return null;
  const campaign = isRecord(value.campaing) ? value.campaing : isRecord(value.campaign) ? value.campaign : null;
  const id = stringValue(value.id).trim();
  const campaignId = stringValue(campaign?.id ?? value.campaing_id ?? value.campaign_id).trim();
  if (!id || !campaignId || !isCampaignMemberStatus(value.status)) return null;
  return {
    id,
    campaignId,
    campaignName: stringValue(campaign?.name).trim() || "Campaña sin nombre",
    platform: stringValue(campaign?.platform).trim(),
    status: value.status,
    assignedUser: adaptAssignedUser(value.assignedUser),
    source: stringValue(value.source).trim(),
    isPrimary: value.is_primary === true,
    createdAt: nullableString(value.created_at),
    updatedAt: nullableString(value.updated_at),
    interactions: adaptLeadInteractions(value.leadInteractions),
  };
};

const adaptPhones = (value: unknown): LeadPhone[] => Array.isArray(value)
  ? value.flatMap((phone) => isRecord(phone) ? [{
    number: nullableString(phone.number),
    type: nullableString(phone.type),
    isPrincipal: typeof phone.isPrincipal === "boolean" ? phone.isPrincipal : null,
    is_principal: typeof phone.is_principal === "boolean" ? phone.is_principal : null,
  }] : [])
  : [];

export const unwrapLeadDetail = (response: unknown): LeadDetailViewModel | null => {
  if (!isRecord(response)) return null;
  const candidate = isRecord(response.data) ? response.data : response;
  const id = stringValue(candidate.id).trim();
  if (!id) return null;
  const campaigns = Array.isArray(candidate.campaignsEngaging)
    ? candidate.campaignsEngaging.map(adaptCampaign).filter((campaign): campaign is LeadCampaignViewModel => campaign !== null)
    : [];
  return {
    id,
    first_name: nullableString(candidate.first_name),
    middle_name: nullableString(candidate.middle_name),
    last_name: nullableString(candidate.last_name),
    profession: nullableString(candidate.profession),
    gender: nullableString(candidate.gender),
    address: nullableString(candidate.address),
    second_address: nullableString(candidate.second_address),
    email: nullableString(candidate.email),
    secondary_email: nullableString(candidate.secondary_email),
    dni: nullableString(candidate.dni),
    lead_status: nullableString(candidate.lead_status),
    created_at: nullableString(candidate.created_at),
    updated_at: nullableString(candidate.updated_at),
    phones: adaptPhones(candidate.phones),
    campaigns,
  };
};

export const unwrapDetailList = <T extends LeadTask>(response: unknown, key: string): T[] => {
  if (Array.isArray(response)) return response as T[];
  if (!isRecord(response)) return [];
  if (Array.isArray(response.data)) return response.data as T[];
  if (isRecord(response.data) && Array.isArray(response.data[key])) return response.data[key] as T[];
  return Array.isArray(response[key]) ? response[key] as T[] : [];
};

export const sellerProfileIdFrom = (response: unknown) => {
  if (!isRecord(response)) return "";
  if (isRecord(response.data)) return stringValue(response.data.id);
  return stringValue(response.id);
};

const sellerName = (seller: UnknownRecord) => {
  const user = isRecord(seller.user) ? seller.user : {};
  return [stringValue(user.first_name), stringValue(user.last_name)].filter(Boolean).join(" ") || "Asesor sin nombre";
};

const campaignOption = (value: unknown): CampaignDialogOption | null => {
  if (!isRecord(value)) return null;
  const id = stringValue(value.id);
  if (!id || stringValue(value.status) !== "ACTIVE") return null;
  const assignments = Array.isArray(value.sellersOnCampaign) ? value.sellersOnCampaign : [];
  return {
    id,
    name: stringValue(value.name) || stringValue(value.campaing_name) || "Campaña sin nombre",
    platform: stringValue(value.platform),
    sellers: assignments.flatMap((assignment) => {
      if (!isRecord(assignment)) return [];
      const nestedSeller = isRecord(assignment.seller) ? assignment.seller : {};
      const nestedUser = isRecord(nestedSeller.user) ? nestedSeller.user : {};
      const sellerProfileId = stringValue(assignment.seller_id) || stringValue(nestedSeller.id);
      const userId = stringValue(nestedSeller.user_id) || stringValue(nestedUser.id);
      return userId && sellerProfileId
        ? [{ userId, sellerProfileId, name: sellerName(nestedSeller) }]
        : [];
    }),
  };
};

export const adaptAvailableCampaigns = (response: unknown): CampaignDialogOption[] => {
  if (!isRecord(response)) return [];
  const data = isRecord(response.data) ? response.data : response;
  const campaigns = Array.isArray(data.campaings) ? data.campaings : [];
  return campaigns.map(campaignOption).filter((campaign): campaign is CampaignDialogOption => Boolean(campaign));
};

export const adaptSellerAvailableCampaigns = (
  response: unknown,
  userId: string,
  sellerProfileId: string,
): CampaignDialogOption[] => {
  if (!isRecord(response)) return [];
  const data = isRecord(response.data) ? response.data : response;
  const assignments = Array.isArray(data.assignedCampaing) ? data.assignedCampaing : [];
  return assignments.flatMap((assignment) => {
    if (!isRecord(assignment)) return [];
    const campaign = campaignOption(assignment.campaign ?? assignment.campaing ?? assignment);
    return campaign
      ? [{ ...campaign, sellers: [{ userId, sellerProfileId, name: "Mi perfil" }] }]
      : [];
  });
};

export const createdMemberIdFrom = (response: unknown) => {
  if (!isRecord(response) || !isRecord(response.data)) return "";
  return stringValue(response.data.id);
};

export const resolveActiveCampaign = (
  campaigns: LeadCampaignViewModel[],
  selectedCampaignId?: string,
): LeadCampaignViewModel | null => campaigns.find((campaign) => (
  campaign.id === selectedCampaignId || campaign.campaignId === selectedCampaignId
)) ?? campaigns.find((campaign) => campaign.isPrimary) ?? campaigns[0] ?? null;

export const campaignIdsFromMembers = (campaigns: LeadCampaignViewModel[]) => new Set(campaigns.map((campaign) => campaign.campaignId));

export const taskDateInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};
