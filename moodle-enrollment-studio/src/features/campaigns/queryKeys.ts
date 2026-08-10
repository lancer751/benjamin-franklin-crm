import type { CampaignsQueryReq } from "./services/campaignService";

export const campaignQueryKeys = {
  all: ["campaigns"] as const,
  lists: () => [...campaignQueryKeys.all, "list"] as const,
  list: (filters: CampaignsQueryReq = {}) =>
    [...campaignQueryKeys.lists(), filters] as const,
  details: () => [...campaignQueryKeys.all, "detail"] as const,
  detail: (campaignId: string) =>
    [...campaignQueryKeys.details(), campaignId] as const,
};

export const metaCampaignKeys = {
  all: ["meta-campaigns"] as const,
  lists: () => [...metaCampaignKeys.all, "list"] as const,
  list: () => [...metaCampaignKeys.lists()] as const,
};

export const metaFormKeys = {
  all: ["meta-forms"] as const,
  lists: () => [...metaFormKeys.all, "list"] as const,
  list: (metaCampaignId: string) =>
    [...metaFormKeys.lists(), metaCampaignId] as const,
};
