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

export interface LeadCampaignMember {
  id: string;
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
  seller?: { id?: string | null; user?: PersonName | null } | null;
}

export interface LeadDetail extends PersonName {
  id: string;
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
  campaignsEngaging?: LeadCampaignMember[] | null;
}

export interface LeadInteraction {
  id?: string;
  notes?: string | null;
  created_by?: string | null;
  type?: string | null;
  created_at?: string | null;
  seller?: { user?: PersonName | null } | null;
}

export interface LeadTask {
  id?: string;
  title?: string | null;
  content?: string | null;
  due_date?: string | null;
  is_done?: boolean | null;
}
