import type { PrismaClient } from "@repo/database";
import { metaService } from "./metaservice";
import { getNextSeller } from "./leadAssigmentService";

// services/leadgenProcessor.ts
export async function processLeadgenEvent(
  prisma: PrismaClient,
  { leadgenId, formId, prefetchedData }: {
    leadgenId: string;
    formId: string;
    prefetchedData?: Awaited<ReturnType<typeof metaService.getLeadgenData>>;
  },
) {
  // Idempotency — bail early if already processed
  const existing = await prisma.campaignMember.findUnique({
    where: { meta_leadgen_id: leadgenId },
    select: { id: true },
  });
  if (existing) return { skipped: true, reason: "already_processed" };

  const campaign = await prisma.campaing.findFirst({
    where: { meta_form_id: formId },
    select: { id: true, status: true },
  });
  if (!campaign) return { skipped: true, reason: "no_campaign_linked" };

  // Core rule: only ingest while ACTIVE. Anything else is silently
  // skipped — the catch-up sync (§6) picks these up once reactivated.
  if (campaign.status !== "ACTIVE") {
    return { skipped: true, reason: "campaign_not_active" };
  }

  const raw = prefetchedData ?? (await metaService.getLeadgenData(leadgenId));
  const { first_name, last_name, email, phone } = metaService.parseFieldData(raw.field_data);

  if (!phone) return { skipped: true, reason: "no_phone_in_submission" };

  return prisma.$transaction(async (tx) => {
    // Dedupe against existing leads by phone (same rule as your manual create flow)
    let lead = await tx.lead.findFirst({
      where: { phones: { some: { number: phone, isPrincipal: true } } },
      select: { id: true },
    });

    if (!lead) {
      lead = await tx.lead.create({
        data: {
          first_name,
          last_name,
          email: email ?? undefined,
          phones: { create: [{ number: phone, type: "WHATSAPP", isPrincipal: true }] },
        },
        select: { id: true },
      });
    }

    const sellerId = await getNextSeller(tx, campaign.id);

    const member = await tx.campaignMember.create({
      data: {
        lead_id: lead.id,
        campaing_id: campaign.id,
        assigned_to: sellerId,
        source: "FACEBOOK", // or derive from platform if you track IG vs FB separately
        meta_leadgen_id: leadgenId,
      },
    });

    return { skipped: false, member };
  });
}

export async function syncMetaLeadsForCampaign(prisma: PrismaClient, campaignId: string) {
  const campaign = await prisma.campaing.findUniqueOrThrow({
    where: { id: campaignId },
    select: { meta_form_id: true, leads_last_synced_at: true, start_date: true },
  });
  if (!campaign.meta_form_id) return;

  const since = campaign.leads_last_synced_at ?? campaign.start_date;
  const leads = await metaService.listFormLeadsSince(campaign.meta_form_id, since);

  let processed = 0;
  for (const lead of leads) {
    const result = await processLeadgenEvent(prisma, {
      leadgenId: lead.id,
      formId: lead.form_id,
      prefetchedData: lead, // already has field_data, skip the extra API call
    });
    if (!result.skipped) processed++;
  }

  await prisma.campaing.update({
    where: { id: campaignId },
    data: { leads_last_synced_at: new Date() },
  });

  return { checked: leads.length, processed };
}