import type {
  OrderLeadContext,
  OrderMatriculatedCampaign,
} from "../types";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizedText(...values: unknown[]): string {
  return values
    .map((value) => stringValue(value).replace(/\s+/g, " "))
    .filter(Boolean)
    .join(" ");
}

function primaryPhone(value: unknown): string {
  if (!Array.isArray(value)) return "";
  const phones = value.filter(isRecord);
  const principal = phones.find(
    (phone) => phone.isPrincipal === true || phone.is_principal === true,
  );
  return stringValue(principal?.number ?? phones[0]?.number);
}

function adaptMatriculatedCampaign(
  value: unknown,
): OrderMatriculatedCampaign | null {
  if (!isRecord(value) || stringValue(value.status) !== "MATRICULADO") {
    return null;
  }

  const campaignId = stringValue(value.campaing_id);
  const campaign = isRecord(value.campaing)
    ? value.campaing
    : isRecord(value.campaign)
      ? value.campaign
      : null;
  if (!campaignId || !campaign) return null;

  const assignedUser = isRecord(value.assignedUser)
    ? value.assignedUser
    : null;

  return {
    memberId: stringValue(value.id),
    campaignId,
    campaignName:
      normalizedText(campaign.name) || "Campaña sin nombre",
    platform: normalizedText(campaign.platform),
    assignedUserId: stringValue(assignedUser?.id),
    assignedUserName: normalizedText(
      assignedUser?.first_name,
      assignedUser?.last_name,
    ),
    isPrimary: value.is_primary === true,
  };
}

export function adaptLeadToOrderContext(
  response: unknown,
): OrderLeadContext | null {
  if (!isRecord(response)) return null;
  const lead = isRecord(response.data) ? response.data : response;
  const leadId = stringValue(lead.id);
  if (!leadId) return null;

  const campaigns = Array.isArray(lead.campaignsEngaging)
    ? lead.campaignsEngaging
        .map(adaptMatriculatedCampaign)
        .filter(
          (campaign): campaign is OrderMatriculatedCampaign =>
            campaign !== null,
        )
    : [];

  return {
    leadId,
    fullName:
      normalizedText(lead.first_name, lead.middle_name, lead.last_name) ||
      "Prospecto sin nombre",
    phone: primaryPhone(lead.phones),
    email: stringValue(lead.email),
    matriculatedCampaigns: campaigns,
  };
}
