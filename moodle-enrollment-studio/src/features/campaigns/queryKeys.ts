export const campaignQueryKeys = {
  all: ["campaigns"] as const,
  details: () => ["campaign"] as const,
  detail: (campaignId: string) => ["campaign", campaignId] as const,
};
