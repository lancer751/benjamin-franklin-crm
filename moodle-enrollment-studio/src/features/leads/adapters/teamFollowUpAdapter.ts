import type { NormalizedLead } from "./leadAdapter";

export interface TeamFollowUpMemberRow {
  id: string;
  leadId: string;
  campaignId: string;
  associatedAt: string;
  programName: string;
  phone: string;
  prospectName: string;
  memberStatus: string;
  advisorName: string | null;
  source: string | null;
  interactionCount: number;
  drawerLead: NormalizedLead;
}

export interface TeamFollowUpMemberPage {
  members: TeamFollowUpMemberRow[];
  total: number;
  page: number;
  limit: number;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const text = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const number = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const cleanName = (...parts: unknown[]): string =>
  parts
    .map(text)
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

const principalPhone = (lead: UnknownRecord): string | null => {
  if (!Array.isArray(lead.phones)) return null;
  const phones = lead.phones.filter(isRecord);
  const principal = phones.find((phone) => phone.isPrincipal === true);
  return principal ? text(principal.number) || null : null;
};

export const adaptTeamFollowUpMemberPage = (
  response: unknown,
  campaignId: string,
  programName: string,
): TeamFollowUpMemberPage => {
  const envelope = isRecord(response) && isRecord(response.data) ? response.data : {};
  const rawMembers = Array.isArray(envelope.data) ? envelope.data.filter(isRecord) : [];

  return {
    members: rawMembers.map((member) => {
      const lead = isRecord(member.lead) ? member.lead : {};
      const assignedUser = isRecord(member.assignedUser) ? member.assignedUser : null;
      const campaignMemberId = text(member.id);
      const leadId = text(member.lead_id) || text(lead.id);
      const memberCampaignId = text(member.campaing_id) || campaignId;
      const firstName = text(lead.first_name);
      const middleName = text(lead.middle_name);
      const lastName = text(lead.last_name);
      const fullName = cleanName(firstName, middleName, lastName);
      const phone = principalPhone(lead);
      const memberStatus = text(member.status);
      const source = text(member.source) || null;
      const assignedUserId = assignedUser ? text(assignedUser.id) : "";
      const advisorName = assignedUser
        ? cleanName(assignedUser.first_name, assignedUser.last_name) || "Asesor sin nombre"
        : null;
      const count = isRecord(member._count) ? number(member._count.leadInteractions, 0) : 0;
      const campaign = {
        id: memberCampaignId,
        name: programName || "No disponible",
        status: "ACTIVE",
      };
      const normalizedMember = {
        id: campaignMemberId,
        lead_id: leadId,
        campaing_id: memberCampaignId,
        campaign_id: memberCampaignId,
        status: memberStatus,
        assigned_to: text(member.assigned_to),
        source: source || "",
        created_at: text(member.created_at),
        is_primary: member.is_primary === true,
        campaign,
        campaing: campaign,
        assignedUser: assignedUser && assignedUserId
          ? {
            id: assignedUserId,
            first_name: text(assignedUser.first_name),
            last_name: text(assignedUser.last_name),
          }
          : null,
      };
      return {
        id: campaignMemberId,
        leadId,
        campaignId: memberCampaignId,
        associatedAt: text(member.created_at),
        programName: programName || "No disponible",
        phone: phone || "No disponible",
        prospectName: fullName || "No disponible",
        memberStatus,
        advisorName,
        source,
        interactionCount: count,
        drawerLead: {
          id: leadId,
          first_name: firstName,
          middle_name: middleName,
          last_name: lastName,
          fullName,
          email: text(lead.email),
          gender: text(lead.gender) || "NOT_SPECIFIED",
          dni: text(lead.dni),
          source: source || "",
          created_at: text(lead.created_at),
          lead_status: memberStatus,
          primary_campaign_id: memberCampaignId,
          courseName: programName || "No disponible",
          phones: phone ? [{ number: phone, type: "CELULAR", isPrincipal: true }] : [],
          campaignsEngaging: [normalizedMember],
          campaignCount: 1,
        },
      };
    }),
    total: number(envelope.total, 0),
    page: number(envelope.page, 1),
    limit: number(envelope.limit, 20),
  };
};
