// workflows/crm/fake-data/fake-campaign-sellers.ts
import { prisma } from "../../..";
import type { fakeSellers } from "./fake-users";
import type { fakeCampaigns } from "./fake-campaigns";

export async function fakeCampaignSellers(
  campaigns: Awaited<ReturnType<typeof fakeCampaigns>>,
  sellers: Awaited<ReturnType<typeof fakeSellers>>,
) {
  const [lpCampaign, pbCampaign] = campaigns;

  // Supervisor 0 sellers (index 0,1,2) → LP campaign
  // Supervisor 1 sellers (index 3,4,5) → PB campaign
  const sup0Sellers = sellers.filter((s) => s.supervisorIndex === 0);
  const sup1Sellers = sellers.filter((s) => s.supervisorIndex === 1);

  const assignments = await prisma.campaignSeller.createMany({
    data: [
      ...sup0Sellers.map((s) => ({
        campaign_id: lpCampaign.id,
        seller_id: s.profile.id,
      })),
      ...sup1Sellers.map((s) => ({
        campaign_id: pbCampaign.id,
        seller_id: s.profile.id,
      })),
    ],
    skipDuplicates: true,
  });

  return assignments;
}