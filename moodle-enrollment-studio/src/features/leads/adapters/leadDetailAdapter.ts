import { isCampaignMemberStatus, type CampaignMemberStatus } from "@/core/constants/campaignMemberStatus";
import { isLeadStatus, type LeadStatus } from "../utils/prospectDisplay";
import type {
  LeadPhone,
  LeadTask,
  LeadTaskViewModel,
  PersonName,
} from "../components/lead-detail/leadDetail.types";
import { adaptLeadInteractions, type LeadInteractionViewModel } from "./leadInteractionAdapter";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";
import {
  adaptCampaignAssignments,
  adaptSellerCampaignAssignments,
  type CampaignAssignmentOption,
  type CampaignSellerOption,
} from "./campaignAssignmentAdapter";

export interface AssignedUserViewModel { id: string; name: string }
export interface LeadCampaignViewModel {
  id: string;
  campaignId: string;
  campaignName: string;
  platform: string | null;
  status: CampaignMemberStatus;
  assignedUser: AssignedUserViewModel | null;
  source: string | null;
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
  lead_status: LeadStatus | null;
  created_at: string | null;
  updated_at: string | null;
  phones: LeadPhone[];
  campaigns: LeadCampaignViewModel[];
}

export type CampaignDialogSeller = CampaignSellerOption;
export type CampaignDialogOption = CampaignAssignmentOption;

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
  return { id, name: normalizedName(value.first_name, value.last_name) || "Asesor sin nombre" };
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
    campaignName: normalizedName(campaign?.name) || "Campaña sin nombre",
    platform: nullableString(campaign?.platform)?.trim() || null,
    status: value.status,
    assignedUser: adaptAssignedUser(value.assignedUser),
    source: nullableString(value.source)?.trim() || null,
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
    lead_status: isLeadStatus(candidate.lead_status) ? candidate.lead_status : null,
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

export const adaptAvailableCampaigns = (
  campaignsResponse: unknown,
  sellersResponse: unknown,
): CampaignDialogOption[] => adaptCampaignAssignments(campaignsResponse, sellersResponse);

export const adaptSellerAvailableCampaigns = (
  response: unknown,
  userId: string,
  sellerProfileId: string,
): CampaignDialogOption[] => {
  return adaptSellerCampaignAssignments(response, userId, sellerProfileId);
};

const adaptLeadTask = (task: LeadTask): LeadTaskViewModel | null => {
  const id = stringValue(task.id).trim();
  if (!id) return null;

  return {
    id,
    title: stringValue(task.title).trim(),
    content: stringValue(task.content).trim(),
    isDone: task.is_done === true,
    dueDate: nullableString(task.due_date),
    author: task.author
      ? {
          firstName: nullableString(task.author.first_name),
          lastName: nullableString(task.author.last_name),
        }
      : null,
    createdAt: stringValue(task.created_at),
    updatedAt: stringValue(task.updated_at),
  };
};

export const adaptLeadTasks = (response: unknown): LeadTaskViewModel[] =>
  unwrapDetailList<LeadTask>(response, "tasks")
    .map(adaptLeadTask)
    .filter((task): task is LeadTaskViewModel => task !== null);

export const createdMemberIdFrom = (response: unknown) => {
  if (!isRecord(response) || !isRecord(response.data)) return "";
  return stringValue(response.data.id);
};

export const resolveActiveCampaignMember = (
  campaigns: LeadCampaignViewModel[],
  selectedMemberId?: string,
): LeadCampaignViewModel | null => campaigns.find((campaign) => (
  campaign.id === selectedMemberId
)) ?? campaigns.find((campaign) => campaign.isPrimary) ?? campaigns[0] ?? null;

export const campaignIdsFromMembers = (campaigns: LeadCampaignViewModel[]) => new Set(campaigns.map((campaign) => campaign.campaignId));

export const taskDateInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};
