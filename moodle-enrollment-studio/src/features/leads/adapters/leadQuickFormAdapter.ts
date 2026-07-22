import type { LeadQuickFormData } from "../schemas/leadQuickFormSchema";
import type { LeadFieldsData, LeadFieldsInput } from "../schemas/leadFieldsSchema";
import type { UpdateLeadReq } from "../services/leadService";

export interface LeadQuickSellerOption {
  id: string;
  name: string;
}

export interface LeadQuickCampaignOption {
  id: string;
  name: string;
  sellers: LeadQuickSellerOption[];
}

interface CampaignRecord {
  id?: string;
  name?: string;
  status?: string;
  sellersOnCampaign?: Array<{
    seller_id?: string;
    seller?: { id?: string; user?: { first_name?: string; last_name?: string } };
  }>;
}

const sellerName = (firstName?: string, lastName?: string) => (
  [firstName, lastName].filter(Boolean).join(" ").trim()
);

export function adaptAllowedCampaigns(response: unknown): LeadQuickCampaignOption[] {
  const body = response as { data?: { campaings?: CampaignRecord[] }; campaings?: CampaignRecord[] } | undefined;
  const campaigns = body?.data?.campaings || body?.campaings || [];
  return campaigns
    .filter((campaign) => campaign.id && campaign.status === "ACTIVE")
    .map((campaign) => ({
      id: campaign.id!,
      name: campaign.name?.trim() || "Campaña sin nombre",
      sellers: (campaign.sellersOnCampaign || [])
        .map((assignment) => ({
          id: assignment.seller_id || assignment.seller?.id || "",
          name: sellerName(assignment.seller?.user?.first_name, assignment.seller?.user?.last_name),
        }))
        .filter((seller) => seller.id && seller.name),
    }));
}

export function adaptSellerCampaigns(response: unknown): LeadQuickCampaignOption[] {
  const body = response as { assignedCampaing?: Array<{ campaign?: CampaignRecord }> } | undefined;
  return (body?.assignedCampaing || [])
    .map((assignment) => assignment.campaign)
    .filter((campaign): campaign is CampaignRecord => Boolean(campaign?.id && campaign.status === "ACTIVE"))
    .map((campaign) => ({ id: campaign.id!, name: campaign.name?.trim() || "Campaña sin nombre", sellers: [] }));
}

export function buildCreateLeadPayload(data: LeadQuickFormData) {
  return {
    first_name: data.first_name,
    middle_name: data.middle_name,
    last_name: data.last_name,
    email: data.email,
    profession: data.profession,
    gender: data.gender,
    address: data.address,
    secondary_email: data.secondary_email,
    dni: data.dni,
    lead_status: "ACTIVE" as const,
    phones: [
      { number: data.cellphone, type: "WHATSAPP" as const, isPrincipal: true },
      ...data.additionalPhones.map((phone) => ({ number: phone.number, type: phone.type, isPrincipal: false })),
    ],
  };
}

interface LeadPhoneRecord {
  id?: string | null;
  number?: string | null;
  type?: string | null;
  isPrincipal?: boolean | null;
  is_principal?: boolean | null;
}

interface LeadRecord {
  id?: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  profession?: string | null;
  gender?: string | null;
  lead_status?: string | null;
  address?: string | null;
  secondary_email?: string | null;
  dni?: string | null;
  phones?: LeadPhoneRecord[] | null;
}

const text = (value: unknown) => typeof value === "string" ? value : "";
const phoneType = (value: unknown): "WHATSAPP" | "TELEPHONE" => value === "TELEPHONE" ? "TELEPHONE" : "WHATSAPP";

export function unwrapLeadForEdit(response: unknown): LeadRecord | null {
  if (!response || typeof response !== "object") return null;
  const body = response as { success?: boolean; data?: unknown; message?: string; error?: string };
  if (body.success === false) throw new Error(body.message || body.error || "No fue posible cargar el prospecto.");
  const candidate = body.data && typeof body.data === "object" ? body.data as LeadRecord : body as LeadRecord;
  return typeof candidate.id === "string" ? candidate : null;
}

export function mapLeadToFormValues(lead: LeadRecord): LeadFieldsInput {
  const phones = Array.isArray(lead.phones) ? lead.phones.filter((phone) => text(phone.number)) : [];
  const principal = phones.find((phone) => phone.isPrincipal === true || phone.is_principal === true) || phones[0];
  return {
    cellphone: text(principal?.number),
    principalPhoneId: text(principal?.id) || undefined,
    principalPhoneType: phoneType(principal?.type),
    first_name: text(lead.first_name),
    middle_name: text(lead.middle_name),
    last_name: text(lead.last_name),
    email: text(lead.email),
    profession: text(lead.profession),
    gender: lead.gender === "MALE" || lead.gender === "FEMALE" ? lead.gender : "NOT_SPECIFIED",
    lead_status: lead.lead_status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    address: text(lead.address),
    secondary_email: text(lead.secondary_email),
    dni: text(lead.dni),
    additionalPhones: phones.filter((phone) => phone !== principal).map((phone) => ({
      id: text(phone.id) || undefined,
      number: text(phone.number),
      type: phoneType(phone.type),
    })),
  };
}

const nullableFields = [
  "first_name", "middle_name", "last_name", "email", "profession", "address", "secondary_email", "dni",
] as const;

const normalizedComparable = (data: LeadFieldsData) => ({
  ...Object.fromEntries(nullableFields.map((field) => [field, data[field] || null])),
  gender: data.gender,
  lead_status: data.lead_status,
  phones: [
    { ...(data.principalPhoneId ? { id: data.principalPhoneId } : {}), number: data.cellphone, type: data.principalPhoneType, isPrincipal: true },
    ...data.additionalPhones.map((phone) => ({ ...(phone.id ? { id: phone.id } : {}), number: phone.number, type: phone.type, isPrincipal: false })),
  ],
});

export function buildUpdateLeadPayload(initial: LeadFieldsData, current: LeadFieldsData): UpdateLeadReq {
  const before = normalizedComparable(initial);
  const after = normalizedComparable(current);
  const payload: Record<string, unknown> = {};
  for (const field of nullableFields) {
    if (before[field] !== after[field]) payload[field] = after[field];
  }
  if (before.gender !== after.gender) payload.gender = after.gender;
  if (before.lead_status !== after.lead_status) payload.lead_status = after.lead_status;
  if (JSON.stringify(before.phones) !== JSON.stringify(after.phones)) payload.phones = after.phones;
  return payload as UpdateLeadReq;
}

export const hasLeadChanges = (initial: LeadFieldsData, current: LeadFieldsData) => (
  Object.keys(buildUpdateLeadPayload(initial, current)).length > 0
);
