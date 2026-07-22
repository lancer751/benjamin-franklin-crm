import type { LeadCampaignMember, LeadDetail, LeadInteraction, LeadTask } from "../components/lead-detail/leadDetail.types";

export interface CampaignDialogSeller { id: string; name: string }
export interface CampaignDialogOption { id: string; name: string; platform: string; sellers: CampaignDialogSeller[] }

type UnknownRecord = Record<string, unknown>;
const isRecord = (value: unknown): value is UnknownRecord => typeof value === "object" && value !== null;
const stringValue = (value: unknown) => typeof value === "string" ? value : "";

export const apiMessage = (response: unknown, fallback: string) => {
  if (!isRecord(response)) return fallback;
  return stringValue(response.message) || stringValue(response.error) || fallback;
};

export const requireSuccess = (response: unknown, fallback: string): UnknownRecord => {
  if (!isRecord(response) || response.success !== true) throw new Error(apiMessage(response, fallback));
  return response;
};

export const unwrapLeadDetail = (response: unknown): LeadDetail | null => {
  if (!isRecord(response)) return null;
  const candidate = isRecord(response.data) ? response.data : response;
  return typeof candidate.id === "string" ? candidate as unknown as LeadDetail : null;
};

export const unwrapDetailList = <T extends LeadInteraction | LeadTask>(response: unknown, key: string): T[] => {
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
      const sellerId = stringValue(assignment.seller_id) || stringValue(nestedSeller.id);
      return sellerId ? [{ id: sellerId, name: sellerName(nestedSeller) }] : [];
    }),
  };
};

export const adaptAvailableCampaigns = (response: unknown): CampaignDialogOption[] => {
  if (!isRecord(response)) return [];
  const data = isRecord(response.data) ? response.data : response;
  const campaigns = Array.isArray(data.campaings) ? data.campaings : [];
  return campaigns.map(campaignOption).filter((campaign): campaign is CampaignDialogOption => Boolean(campaign));
};

export const adaptSellerAvailableCampaigns = (response: unknown, sellerId: string): CampaignDialogOption[] => {
  if (!isRecord(response)) return [];
  const data = isRecord(response.data) ? response.data : response;
  const assignments = Array.isArray(data.assignedCampaing) ? data.assignedCampaing : [];
  return assignments.flatMap((assignment) => {
    if (!isRecord(assignment)) return [];
    const campaign = campaignOption(assignment.campaign ?? assignment.campaing ?? assignment);
    return campaign ? [{ ...campaign, sellers: [{ id: sellerId, name: "Mi perfil" }] }] : [];
  });
};

export const createdMemberIdFrom = (response: unknown) => {
  if (!isRecord(response) || !isRecord(response.data)) return "";
  return stringValue(response.data.id);
};

export const campaignIdsFromMembers = (members: LeadCampaignMember[]) => new Set(members.map((member) => (
  member.campaing?.id || member.campaign?.id || member.campaing_id || member.campaign_id || ""
)).filter(Boolean));

export const taskDateInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};
