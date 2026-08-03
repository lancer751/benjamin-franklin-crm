export interface NormalizedCampaign {
  id: string;
  name: string;
  status: string;
  platform?: string;
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
  assignedUser: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
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

export interface NormalizedLeadPhone {
  number: string;
  type: string;
  isPrincipal: boolean;
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
  phones: NormalizedLeadPhone[];
  campaignsEngaging: NormalizedCampaignMember[];
}

export interface ProspectPresentationRow {
  id: string;
  createdAt: string;
  fullName: string;
  initials: string;
  dni: string;
  email: string;
  phone: string;
  campaignName: string;
  campaignPlatform: string;
  additionalCampaignCount: number;
  additionalCampaignNames: string[];
  memberStatus: string;
  sellerName: string;
}

export interface LeadPage {
  leads: any[];
  total: number;
  page: number;
  limit: number;
}

export const normalizeCampaignOptions = (serverRes: any): NormalizedAssignedCampaign[] => {
  const campaigns = serverRes?.data?.campaings
    || serverRes?.campaings
    || serverRes?.data?.data?.campaings
    || [];

  const campaignsById = new Map<string, NormalizedAssignedCampaign>();
  if (!Array.isArray(campaigns)) return [];

  campaigns.forEach((campaign: any) => {
    if (campaign?.id) {
      campaignsById.set(campaign.id, {
        id: campaign.id,
        name: campaign.name?.trim() || campaign.campaing_name?.trim() || "Sin campaña",
      });
    }
  });

  return Array.from(campaignsById.values());
};

export const resolvePresentationMember = (
  lead: NormalizedLead,
  campaignId?: string,
  assignedUserId?: string,
  memberStatus?: string,
): NormalizedCampaignMember | undefined => {
  const members = lead.campaignsEngaging || [];
  const matchesActiveCommercialFilters = (member: NormalizedCampaignMember) =>
    (!campaignId || member.campaign_id === campaignId || member.campaing_id === campaignId)
    && (!assignedUserId
      || member.assignedUser?.id === assignedUserId
      || member.assigned_to === assignedUserId)
    && (!memberStatus || member.status === memberStatus);

  if (campaignId || assignedUserId || memberStatus) {
    const filteredMember = members.find(matchesActiveCommercialFilters);
    if (filteredMember) return filteredMember;
  }
  if (campaignId) {
    const campaignMember = members.find(
      (member) => member.campaign_id === campaignId || member.campaing_id === campaignId,
    );
    if (campaignMember) return campaignMember;
  } else {
    const primaryMember = members.find((member) => member.is_primary);
    if (primaryMember) return primaryMember;
  }
  return members[0];
};

export const adaptProspectRows = (
  leads: NormalizedLead[],
  activeCampaignId?: string,
  activeAssignedUserId?: string,
  activeMemberStatus?: string,
): ProspectPresentationRow[] => leads.map((lead) => {
  const member = resolvePresentationMember(
    lead,
    activeCampaignId,
    activeAssignedUserId,
    activeMemberStatus,
  );
  const phone = lead.phones.find((item) => item.isPrincipal) || lead.phones[0];
  const initials = [lead.first_name, lead.last_name]
    .filter(Boolean)
    .map((value) => value.charAt(0).toUpperCase())
    .join("");
  const additionalCampaignNames = activeCampaignId
    ? []
    : lead.campaignsEngaging
      .filter((item) => item.id !== member?.id)
      .map((item) => item.campaign.name)
      .filter(Boolean);
  const assignedUser = member?.assignedUser;
  const advisorName = assignedUser
    ? [assignedUser.first_name, assignedUser.last_name]
      .map((value) => value.trim())
      .filter(Boolean)
      .join(" ")
      .replace(/\s+/g, " ") || "Asesor sin nombre"
    : "Sin asignar";

  return {
    id: lead.id,
    createdAt: lead.created_at,
    fullName: lead.fullName || "Sin nombre",
    initials: initials || "—",
    dni: lead.dni || "Sin DNI",
    email: lead.email || "Sin correo",
    phone: phone?.number || "Sin celular",
    campaignName: member?.campaign.name || "Sin campaña",
    campaignPlatform: member?.campaign.platform || "",
    additionalCampaignCount: additionalCampaignNames.length,
    additionalCampaignNames,
    memberStatus: member?.status || "",
    sellerName: advisorName,
  };
});

/** Reads the stable GET /api/leads response contract without changing its shape. */
export const unpackLeadPage = (serverRes: any): LeadPage => {
  const data = serverRes?.data;
  return {
    leads: Array.isArray(data?.leads) ? data.leads : [],
    total: Number.isFinite(Number(data?.total)) ? Number(data.total) : 0,
    page: Number.isFinite(Number(data?.page)) ? Number(data.page) : 1,
    limit: Number.isFinite(Number(data?.limit)) ? Number(data.limit) : 20,
  };
};

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
  const assignedCampaing = serverRes?.data?.data?.assignedCampaing
    || serverRes?.data?.assignedCampaing
    || serverRes?.assignedCampaing
    || [];

  const campaignsById = new Map<string, NormalizedAssignedCampaign>();
  if (!Array.isArray(assignedCampaing)) return [];

  assignedCampaing.forEach((assignment: any) => {
    const campaign = assignment?.campaign || assignment?.campaing || assignment;
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
export const sanitizePhones = (phones: any[] | null | undefined): NormalizedLeadPhone[] => {
  if (!Array.isArray(phones)) return [];
  return phones.map(p => ({
    number: p?.number || "S/N",
    type: p?.type || "CELULAR",
    isPrincipal: Boolean(p?.isPrincipal),
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
      platform: rawC.platform,
      campaing_name: rawC.campaing_name || rawC.name,
      relatedProduct: rawC.relatedProduct
    };

    const phones = sanitizePhones(lead.phones || member.phones);

    const normalizedMember: NormalizedCampaignMember = {
      id: member.id || "",
      lead_id: member.lead_id || lead.id || "",
      campaing_id: member.campaing_id || member.campaign_id || "",
      campaign_id: member.campaign_id || member.campaing_id || "",
      status: member.status || "NUEVO",
      assigned_to: member.assigned_to || "",
      source: member.source || lead.source || "WHATSAPP",
      created_at: member.created_at || lead.created_at || "",
      is_primary: Boolean(member.is_primary),
      campaign,
      campaing: campaign,
      assignedUser: member.assignedUser ?? null,
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
      lead_status: member.status || "NUEVO",
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
        platform: rawC.platform,
        campaing_name: rawC.campaing_name || rawC.name,
        relatedProduct: rawC.relatedProduct
      };

      return {
        id: member.id || "",
        lead_id: member.lead_id || lead.id || "",
        campaing_id: member.campaing_id || member.campaign_id || "",
        campaign_id: member.campaign_id || member.campaing_id || "",
        status: member.status || "NUEVO",
        assigned_to: member.assigned_to || "",
        source: member.source || "WHATSAPP",
        created_at: member.created_at || "",
        is_primary: Boolean(member.is_primary),
        campaign,
        campaing: campaign,
        assignedUser: member.assignedUser ?? null,
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
