export interface LeadDetailCapabilities {
  canEditLead: boolean;
  canAddCampaign: boolean;
  canCreateInteraction: boolean;
  canManageTasks: boolean;
  canDeleteLead: boolean;
}

export const leadDetailCapabilities = (role?: string): LeadDetailCapabilities => {
  const canOperateLead = ["ADMIN", "SALES_SUPERVISOR", "SALES_REP", "MARKETING"].includes(role || "");
  return {
    canEditLead: canOperateLead,
    canAddCampaign: canOperateLead,
    canCreateInteraction: canOperateLead,
    canManageTasks: ["ADMIN", "SALES_SUPERVISOR", "SALES_REP"].includes(role || ""),
    canDeleteLead: ["ADMIN", "SALES_SUPERVISOR"].includes(role || ""),
  };
};
