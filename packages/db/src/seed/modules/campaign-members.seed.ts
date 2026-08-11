import type { CampaignMemberStatus, PrismaClient } from "../../../generated/prisma/client";
import type { SeedMember } from "../context";

const STATUSES: CampaignMemberStatus[] = ["NUEVO", "CONTACTADO", "MATRICULADO", "MATRICULADO", "SEGUIMIENTO"];

export async function seedCampaignMembers(
  prisma: PrismaClient, campaignId: string, leadIds: string[], sellerUserIds: string[],
): Promise<SeedMember[]> {
  const members: SeedMember[] = [];

  for (let i = 0; i < leadIds.length; i++) {
    const assignedTo = sellerUserIds[i % sellerUserIds.length]!;
    const status = STATUSES[i % STATUSES.length]!;
    const member = await prisma.campaignMember.upsert({
      where: { lead_id_campaing_id: { lead_id: leadIds[i]!, campaing_id: campaignId } },
      update: {},
      create: { lead_id: leadIds[i]!, campaing_id: campaignId, assigned_to: assignedTo, status, source: "FACEBOOK" },
    });
    members.push({ id: member.id, assignedTo, status: member.status });
  }

  console.log(`  ✓ ${members.length} miembros de campaña (${members.filter((m) => m.status === "MATRICULADO").length} MATRICULADO)`);
  return members;
}