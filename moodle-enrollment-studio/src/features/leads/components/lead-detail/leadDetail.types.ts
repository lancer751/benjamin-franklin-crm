import type { LeadInteractionApiRecord } from "../../adapters/leadInteractionAdapter";

export interface LeadPhone {
  number?: string | null;
  type?: string | null;
  isPrincipal?: boolean | null;
  is_principal?: boolean | null;
}

export interface PersonName {
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
}

export interface LeadCampaignMemberApiRecord {
  id?: string;
  lead_id?: string | null;
  campaing_id?: string | null;
  campaign_id?: string | null;
  status?: string | null;
  assigned_to?: string | null;
  source?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  is_primary?: boolean | null;
  campaing?: { id?: string | null; name?: string | null; platform?: string | null } | null;
  campaign?: { id?: string | null; name?: string | null; platform?: string | null } | null;
  assignedUser?: { id?: string; first_name?: string | null; last_name?: string | null } | null;
  leadInteractions?: LeadInteractionApiRecord[] | null;
}

export interface LeadDetailApiRecord extends PersonName {
  id?: string;
  profession?: string | null;
  gender?: string | null;
  address?: string | null;
  second_address?: string | null;
  email?: string | null;
  secondary_email?: string | null;
  dni?: string | null;
  lead_status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  phones?: LeadPhone[] | null;
  campaignsEngaging?: LeadCampaignMemberApiRecord[] | null;
}

export interface LeadTask {
  id?: string;
  title?: string | null;
  content?: string | null;
  due_date?: string | null;
  is_done?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  author?: PersonName | null;
}
