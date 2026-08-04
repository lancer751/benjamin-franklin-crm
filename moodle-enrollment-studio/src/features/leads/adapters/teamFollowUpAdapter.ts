export interface TeamFollowUpMemberRow {
  id: string;
  campaignId: string;
  associatedAt: string;
  programName: string;
  phone: string;
  prospectName: string;
  memberStatus: string;
  advisorName: string;
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

const principalPhone = (lead: UnknownRecord): string => {
  if (!Array.isArray(lead.phones)) return "No disponible";
  const phones = lead.phones.filter(isRecord);
  const principal = phones.find((phone) => phone.isPrincipal === true) ?? phones[0];
  return principal ? text(principal.number) || "No disponible" : "No disponible";
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
      const assignedUser = isRecord(member.assignedUser) ? member.assignedUser : {};
      return {
        id: text(member.id),
        campaignId,
        associatedAt: text(member.created_at),
        programName: programName || "No disponible",
        phone: principalPhone(lead),
        prospectName: cleanName(lead.first_name, lead.middle_name, lead.last_name) || "No disponible",
        memberStatus: text(member.status),
        advisorName: cleanName(assignedUser.first_name, assignedUser.last_name) || "No disponible",
      };
    }),
    total: number(envelope.total, 0),
    page: number(envelope.page, 1),
    limit: number(envelope.limit, 20),
  };
};
