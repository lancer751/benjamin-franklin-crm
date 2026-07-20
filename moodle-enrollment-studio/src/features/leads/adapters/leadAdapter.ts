export interface NormalizedCampaign {
  id: string;
  name: string;
  status: string;
  campaing_name?: string;
  relatedProduct?: {
    name?: string;
  };
}

export interface NormalizedCampaignMember {
  id: string;
  lead_id: string;
  campaing_id: string;
  campaign_id: string;
  status: string;
  assigned_to: string;
  source: string;
  created_at: string;
  is_primary: boolean;
  campaign: NormalizedCampaign;
  campaing: NormalizedCampaign; // compatibility fallback
  seller?: {
    id: string;
    user?: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

export interface NormalizedAssignedCampaign {
  id: string;
  name: string;
}

export interface NormalizedLead {
  id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  fullName: string;
  email: string;
  gender: string;
  dni: string;
  source: string;
  created_at: string;
  lead_status: string;
  primary_campaign_id: string;
  courseName: string;
  phones: { number: string; type: string }[];
  campaignsEngaging: NormalizedCampaignMember[];
}

/**
 * Robustly unpacks leads array from Honos response variations.
 */
export const unpackLeads = (serverRes: any): any[] => {
  if (!serverRes) return [];
  const rawData = serverRes?.data?.leads
    || serverRes?.data?.data?.leads
    || serverRes?.data?.data
    || serverRes?.data
    || serverRes?.leads
    || [];
  return Array.isArray(rawData) ? rawData : [];
};

export const normalizeAssignedCampaigns = (serverRes: any): NormalizedAssignedCampaign[] => {
  const assignedCampaing = serverRes?.data?.assignedCampaing
    || serverRes?.assignedCampaing
    || [];

  const campaignsById = new Map<string, NormalizedAssignedCampaign>();
  if (!Array.isArray(assignedCampaing)) return [];

  assignedCampaing.forEach((assignment: any) => {
    const campaign = assignment?.campaign;
    if (campaign?.id) {
      campaignsById.set(campaign.id, {
        id: campaign.id,
        name: campaign.name?.trim() || "Sin campaña",
      });
    }
  });

  return Array.from(campaignsById.values());
};

/**
 * Safely sanitizes the phone list.
 */
export const sanitizePhones = (phones: any[] | null | undefined): { number: string; type: string }[] => {
  if (!Array.isArray(phones)) return [];
  return phones.map(p => ({
    number: p?.number || "S/N",
    type: p?.type || "CELULAR"
  }));
};

/**
 * Adapts campaign members array (from getCampaignMembers) to NormalizedLead list.
 */
export const adaptCampaignMembers = (rawMembers: any[]): NormalizedLead[] => {
  if (!Array.isArray(rawMembers)) return [];
  return rawMembers.map((member: any) => {
    const lead = member.lead || member;
    const rawC = member.campaign || member.campaing || {};
    const cName = rawC.name || rawC.campaing_name || rawC.relatedProduct?.name || "Sin especificar";
    
    const campaign: NormalizedCampaign = {
      id: rawC.id || member.campaing_id || lead.primary_campaign_id || "",
      name: cName,
      status: rawC.status || "ACTIVE",
      campaing_name: rawC.campaing_name || rawC.name,
      relatedProduct: rawC.relatedProduct
    };

    const phones = sanitizePhones(lead.phones || member.phones);

    const normalizedMember: NormalizedCampaignMember = {
      id: member.id || "",
      lead_id: member.lead_id || lead.id || "",
      campaing_id: member.campaing_id || member.campaign_id || "",
      campaign_id: member.campaign_id || member.campaing_id || "",
      status: member.status || lead.lead_status || "NEW",
      assigned_to: member.assigned_to || "",
      source: member.source || lead.source || "WHATSAPP",
      created_at: member.created_at || lead.created_at || "",
      is_primary: Boolean(member.is_primary),
      campaign,
      campaing: campaign,
      seller: member.seller
    };

    const first_name = lead.first_name || "";
    const middle_name = lead.middle_name || "";
    const last_name = lead.last_name || "";
    const fullName = `${first_name} ${middle_name ? middle_name + ' ' : ''}${last_name}`.replace(/\s+/g, ' ').trim();

    return {
      id: lead.id || member.lead_id || member.id || "",
      first_name,
      middle_name,
      last_name,
      fullName,
      email: lead.email || "",
      gender: lead.gender || "NOT_SPECIFIED",
      dni: lead.dni || "",
      source: lead.source || member.source || "WHATSAPP",
      created_at: member.created_at || lead.created_at || "",
      lead_status: member.status || lead.lead_status || "ACTIVE",
      primary_campaign_id: lead.primary_campaign_id || member.campaing_id || "",
      courseName: cName,
      phones,
      campaignsEngaging: [normalizedMember]
    };
  });
};

/**
 * Adapts raw leads list (from getAllLeads) to NormalizedLead list.
 */
export const adaptLeads = (rawLeads: any[]): NormalizedLead[] => {
  if (!Array.isArray(rawLeads)) return [];
  return rawLeads.map((lead: any) => {
    const first_name = lead.first_name || "";
    const middle_name = lead.middle_name || "";
    const last_name = lead.last_name || "";
    const fullName = `${first_name} ${middle_name ? middle_name + ' ' : ''}${last_name}`.replace(/\s+/g, ' ').trim();
    const phones = sanitizePhones(lead.phones);

    const campaignsEngaging = (lead.campaignsEngaging || []).map((member: any) => {
      const rawC = member.campaign || member.campaing || {};
      const cName = rawC.name || rawC.campaing_name || rawC.relatedProduct?.name || "Sin especificar";
      
      const campaign: NormalizedCampaign = {
        id: rawC.id || member.campaing_id || "",
        name: cName,
        status: rawC.status || "ACTIVE",
        campaing_name: rawC.campaing_name || rawC.name,
        relatedProduct: rawC.relatedProduct
      };

      return {
        id: member.id || "",
        lead_id: member.lead_id || lead.id || "",
        campaing_id: member.campaing_id || member.campaign_id || "",
        campaign_id: member.campaign_id || member.campaing_id || "",
        status: member.status || "NEW",
        assigned_to: member.assigned_to || "",
        source: member.source || "WHATSAPP",
        created_at: member.created_at || "",
        is_primary: Boolean(member.is_primary),
        campaign,
        campaing: campaign,
        seller: member.seller
      };
    });

    const firstMember = campaignsEngaging?.[0];
    const courseName = firstMember?.campaign?.name || lead.primary_campaign_id || "Sin especificar";

    return {
      id: lead.id || "",
      first_name,
      middle_name,
      last_name,
      fullName,
      email: lead.email || "",
      gender: lead.gender || "NOT_SPECIFIED",
      dni: lead.dni || "",
      source: lead.source || "WHATSAPP",
      created_at: lead.created_at || "",
      lead_status: lead.lead_status || "ACTIVE",
      primary_campaign_id: lead.primary_campaign_id || "",
      courseName,
      phones,
      campaignsEngaging
    };
  });
};
