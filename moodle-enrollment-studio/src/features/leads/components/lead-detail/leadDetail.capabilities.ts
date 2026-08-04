export interface LeadDetailCapabilities {
  canEditLead: boolean;
  canAddCampaign: boolean;
  canCreateInteraction: boolean;
  canManageTasks: boolean;
  canChangeCampaignStage: boolean;
  canDeleteLead: boolean;
}

export interface LeadDrawerCapabilities {
  canEditLead: boolean;
  canChangeStatus: boolean;
  canCreateInteraction: boolean;
  canCreateTask: boolean;
  canUpdateTask: boolean;
  canDeleteTask: boolean;
}

export const leadDetailCapabilities = (role?: string): LeadDetailCapabilities => {
  const canOperateLead = ["ADMIN", "SALES_SUPERVISOR", "SALES_REP", "MARKETING"].includes(role || "");
  return {
    canEditLead: canOperateLead,
    canAddCampaign: canOperateLead,
    canCreateInteraction: canOperateLead,
    canManageTasks: ["ADMIN", "SALES_SUPERVISOR", "SALES_REP"].includes(role || ""),
    canChangeCampaignStage: canOperateLead,
    canDeleteLead: ["ADMIN", "SALES_SUPERVISOR"].includes(role || ""),
  };
};

export const leadDrawerCapabilities = (role?: string): LeadDrawerCapabilities => ({
  canEditLead: ["ADMIN", "SALES_SUPERVISOR", "SALES_REP", "MARKETING"].includes(role || ""),
  canChangeStatus: ["ADMIN", "SALES_SUPERVISOR", "SALES_REP", "MARKETING"].includes(role || ""),
  canCreateInteraction: ["ADMIN", "SALES_SUPERVISOR", "SALES_REP", "MARKETING"].includes(role || ""),
  canCreateTask: ["ADMIN", "SALES_SUPERVISOR", "SALES_REP", "MARKETING"].includes(role || ""),
  canUpdateTask: ["ADMIN", "SALES_SUPERVISOR", "SALES_REP"].includes(role || ""),
  canDeleteTask: ["ADMIN", "SALES_SUPERVISOR", "SALES_REP"].includes(role || ""),
});
