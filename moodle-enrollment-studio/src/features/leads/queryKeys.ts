import type { CampaignMembersQueryReq } from "@/features/campaigns/services/campaignService";
import type { LeadListQuery } from "./services/leadService";

export interface LeadLookupKeyParams {
  phone?: string;
  email?: string;
  campaignId: string;
  sellerProfileId: string;
}

export interface CampaignMemberListKeyParams {
  campaignId: string;
  filters: CampaignMembersQueryReq;
}

export const leadKeys = {
  all: ["leads"] as const,
  lists: () => [...leadKeys.all, "list"] as const,
  list: (filters: LeadListQuery = {}) => [...leadKeys.lists(), filters] as const,
  details: () => [...leadKeys.all, "detail"] as const,
  detail: (leadId: string) => [...leadKeys.details(), leadId] as const,
  lookups: () => [...leadKeys.all, "lookup"] as const,
  lookup: (params: LeadLookupKeyParams) => [...leadKeys.lookups(), params] as const,
};

export const campaignMemberKeys = {
  all: ["campaign-members"] as const,
  lists: () => [...campaignMemberKeys.all, "list"] as const,
  list: ({ campaignId, filters }: CampaignMemberListKeyParams) =>
    [...campaignMemberKeys.lists(), campaignId, filters] as const,
  details: () => [...campaignMemberKeys.all, "detail"] as const,
  detail: (campaignId: string, memberId: string) =>
    [...campaignMemberKeys.details(), campaignId, memberId] as const,
  interactions: (campaignId: string, memberId: string) =>
    [...campaignMemberKeys.detail(campaignId, memberId), "interactions"] as const,
  tasks: (campaignId: string, memberId: string) =>
    [...campaignMemberKeys.detail(campaignId, memberId), "tasks"] as const,
};
