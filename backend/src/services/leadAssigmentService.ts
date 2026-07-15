import type { TransactionClient } from "@repo/database";

export async function getNextSeller(tx: TransactionClient, campaignId: string) {
  const campaign = await tx.campaing.findUniqueOrThrow({
    where: { id: campaignId },
    select: { next_seller_cursor: true },
  });

  const sellers = await tx.campaignSeller.findMany({
    where: { campaign_id: campaignId },
    orderBy: { assigned_at: "asc" }, // stable, predictable order
    select: { seller_id: true },
  });

  if (sellers.length === 0)
    throw { code: "INVALID", message: "Campaign has no sellers assigned" };

  const index = campaign.next_seller_cursor % sellers.length;
  const nextSellerId = sellers[index]!.seller_id;

  await tx.campaing.update({
    where: { id: campaignId },
    data: { next_seller_cursor: { increment: 1 } },
  });

  return nextSellerId;
}