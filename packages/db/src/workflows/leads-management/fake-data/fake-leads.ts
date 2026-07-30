// workflows/crm/fake-data/fake-leads.ts
import { prisma } from "../../..";
import { fakerES as faker } from "@faker-js/faker";
import type { fakeCampaigns } from "./fake-campaigns";
import type { fakeSellers } from "./fake-users";

// Round-robin: pick the seller with the fewest members in this campaign
async function pickSeller(
  campaignId: string,
  sellerIds: string[],
): Promise<string> {
  const counts = await prisma.campaignMember.groupBy({
    by: ["assigned_to"],
    where: { campaing_id: campaignId, assigned_to: { in: sellerIds } },
    _count: { assigned_to: true },
  });

  const countMap = new Map(
    counts.map((c) => [c.assigned_to, c._count.assigned_to]),
  );
  const sorted = sellerIds
    .map((id) => ({ id, count: countMap.get(id) ?? 0 }))
    .sort((a, b) => a.count - b.count);

  if (sorted.length === 0) {
    throw new Error(`No sellers available for campaign ${campaignId}`);
  }

  return sorted[0]!.id;
}

const LEAD_SOURCES = ["FACEBOOK", "INSTAGRAM", "WHATSAPP", "WEBSITE"] as const;

const STATUSES = [
  "NEW",
  "CONTACTED",
  "ATTEMPTED_CONTACT",
  "QUALIFIED",
  "FOLLOW_UP",
  "ON_HOLD",
  "WON",
  "LOST",
] as const;

const INTERACTION_TYPES = ["CALL", "WHATSAPP", "EMAIL", "MEETING"] as const;

export async function fakeLeads(
  campaigns: Awaited<ReturnType<typeof fakeCampaigns>>,
  sellers: Awaited<ReturnType<typeof fakeSellers>>,
) {
  const [lpCampaign, pbCampaign] = campaigns;

  const sup0SellerIds = sellers
    .filter((s) => s.supervisorIndex === 0)
    .map((s) => s.profile.id);

  const sup1SellerIds = sellers
    .filter((s) => s.supervisorIndex === 1)
    .map((s) => s.profile.id);

  const allMembers: Awaited<ReturnType<typeof createLeadWithMember>>[] = [];

  // Create 8 leads for LP campaign, 6 for PB campaign
  const lpLeadCount = 8;
  const pbLeadCount = 6;

  for (let i = 0; i < lpLeadCount; i++) {
    const sellerId = await pickSeller(lpCampaign.id, sup0SellerIds);
    const member = await createLeadWithMember(lpCampaign.id, sellerId, i);
    allMembers.push(member);
  }

  for (let i = 0; i < pbLeadCount; i++) {
    const sellerId = await pickSeller(pbCampaign.id, sup1SellerIds);
    const member = await createLeadWithMember(pbCampaign.id, sellerId, i);
    allMembers.push(member);
  }

  return allMembers;
}

async function createLeadWithMember(
  campaignId: string,
  sellerId: string,
  index: number,
) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  // Vary statuses across leads so the seed is realistic
  const statusIndex = index % STATUSES.length;
  const status = STATUSES[statusIndex];
  const source = LEAD_SOURCES[index % LEAD_SOURCES.length];

  // Create lead
  const lead = await prisma.lead.create({
    data: {
      first_name: firstName,
      middle_name: "",
      last_name: lastName,
      email: faker.internet.email({ firstName, lastName }),
      profession: faker.person.jobTitle(),
      lead_status: "ACTIVE",
      primary_campaign_id: campaignId,
      phones: {
        create: [
          {
            number: `9${faker.string.numeric(8)}`,
            type: "WHATSAPP",
          },
        ],
      },
    },
  });

  // Create CampaignMember
  const member = await prisma.campaignMember.create({
    data: {
      lead_id: lead.id,
      campaing_id: campaignId,
      assigned_to: sellerId,
      source: source!,
      status,
      is_primary: true,
    },
  });

  // Add 1–3 interactions for leads that have been contacted
  if (!["NEW"].includes(status!)) {
    const interactionCount = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < interactionCount; j++) {
      await prisma.leadInteraction.create({
        data: {
          lead_id: lead.id,
          campaing_id: member.id,
          created_by: sellerId,
          type: INTERACTION_TYPES[j % INTERACTION_TYPES.length]!,
          notes: faker.lorem.sentence({ min: 6, max: 14 }),
        },
      });
    }
  }

  // Add 1–2 tasks for FOLLOW_UP and ON_HOLD leads
  if (["FOLLOW_UP", "ON_HOLD", "QUALIFIED"].includes(status!)) {
    const taskCount = faker.number.int({ min: 1, max: 2 });
    for (let k = 0; k < taskCount; k++) {
      await prisma.tasks.create({
        data: {
          title: faker.helpers.arrayElement([
            "Llamar para seguimiento",
            "Enviar brochure por WhatsApp",
            "Confirmar disponibilidad de horario",
            "Enviar link de inscripción",
            "Resolver duda sobre precio",
          ]),
          content: faker.lorem.sentence({ min: 8, max: 16 }),
          is_done: faker.datatype.boolean({ probability: 0.3 }),
          due_date: faker.date.soon({ days: 14 }),
          lead_id: lead.id,
          campaign_member_id: member.id,
          created_by: sellerId,
        },
      });
    }
  }

  return { lead, member };
}
