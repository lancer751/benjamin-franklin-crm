import type { PrismaClient } from "../../../generated/prisma/client";
import type { SeedCampaign } from "../context";

export async function seedCampaigns(
  prisma: PrismaClient, productId: string, supervisorProfileId: string, sellerProfileIds: string[],
): Promise<SeedCampaign> {
  const campaign = await prisma.campaing.upsert({
    where: { product_id: productId },
    update: {},
    create: {
      name: "Lanzamiento Full Stack 2026", initial_budget: "1500.00", status: "ACTIVE",
      start_date: new Date("2026-08-01"), platform: "FACEBOOK", is_organic: false,
      product_id: productId, supervisor_id: supervisorProfileId,
    },
  });

  for (const sellerProfileId of sellerProfileIds) {
    await prisma.campaignSeller.upsert({
      where: { campaign_id_seller_id: { campaign_id: campaign.id, seller_id: sellerProfileId } },
      update: {}, create: { campaign_id: campaign.id, seller_id: sellerProfileId },
    });
  }

  console.log(`  ✓ 1 campaña, ${sellerProfileIds.length} vendedores asignados`);
  return { campaignId: campaign.id };
}