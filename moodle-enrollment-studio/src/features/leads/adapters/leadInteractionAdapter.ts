import { interactionTypeLabel } from "../utils/interactionType.constants";

export interface LeadInteractionApiRecord {
  id?: string;
  lead_id?: string;
  notes?: string;
  created_by?: string;
  campaing_id?: string;
  type?: string;
  created_at?: string | null;
  updated_at?: string | null;
  userCreator?: {
    id?: string;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
}

export interface LeadInteractionViewModel {
  id: string;
  type: string;
  typeLabel: string;
  notes: string;
  creatorName: string;
  createdAt: string | null;
  updatedAt: string | null;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => typeof value === "object" && value !== null;
const stringValue = (value: unknown): string => typeof value === "string" ? value : "";
const nullableString = (value: unknown): string | null => typeof value === "string" ? value : null;
const normalizeNamePart = (value: unknown): string => stringValue(value).trim().replace(/\s+/g, " ");

export const adaptLeadInteraction = (value: unknown): LeadInteractionViewModel | null => {
  if (!isRecord(value)) return null;
  const candidate = isRecord(value.data) ? value.data : value;
  const id = stringValue(candidate.id).trim();
  if (!id) return null;

  const creator = isRecord(candidate.userCreator) ? candidate.userCreator : null;
  const creatorName = creator
    ? [normalizeNamePart(creator.first_name), normalizeNamePart(creator.last_name)].filter(Boolean).join(" ")
    : "";
  const type = stringValue(candidate.type).trim();

  return {
    id,
    type,
    typeLabel: interactionTypeLabel(type),
    notes: stringValue(candidate.notes),
    creatorName: creatorName || "Usuario no disponible",
    createdAt: nullableString(candidate.created_at),
    updatedAt: nullableString(candidate.updated_at),
  };
};

export const adaptLeadInteractions = (values: unknown): LeadInteractionViewModel[] => {
  if (!Array.isArray(values)) return [];
  return values.map(adaptLeadInteraction).filter((interaction): interaction is LeadInteractionViewModel => interaction !== null);
};

export const adaptLeadInteractionsResponse = (response: unknown): LeadInteractionViewModel[] => {
  if (Array.isArray(response)) return adaptLeadInteractions(response);
  if (!isRecord(response)) return [];
  if (Array.isArray(response.data)) return adaptLeadInteractions(response.data);
  if (isRecord(response.data) && Array.isArray(response.data.interactions)) return adaptLeadInteractions(response.data.interactions);
  if (Array.isArray(response.interactions)) return adaptLeadInteractions(response.interactions);
  return [];
};
