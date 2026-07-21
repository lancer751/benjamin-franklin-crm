import type { Prisma, PrismaClient } from "@repo/database";
import type {
  MarketingReportQuery,
  SalesReportQuery,
  CollectionsReportQuery,
  MetaReportQuery,
} from "shared";


function dateRangeFilter(from?: Date, to?: Date): Prisma.DateTimeFilter | undefined {
  if (!from && !to) return undefined;
  return {
    ...(from && { gte: from }),
    ...(to && { lte: to }),
  };
}

function toNumber(value: Prisma.Decimal | null | undefined): number {
  return value ? Number(value) : 0;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function reportRepository(prisma: PrismaClient) {
  return {
    async marketing(query: MarketingReportQuery) {
      const { from, to, campaign_id, platform } = query;

      const where: Prisma.CampaignMemberWhereInput = {
        created_at: dateRangeFilter(from, to),
        ...(campaign_id && { campaing_id: campaign_id }),
        ...(platform && { campaing: { platform } }),
      };

      const [totalLeads, byStatus, bySource, byCampaign] = await Promise.all([
        prisma.campaignMember.count({ where }),
        prisma.campaignMember.groupBy({
          by: ["status"],
          where,
          _count: { _all: true },
        }),
        prisma.campaignMember.groupBy({
          by: ["source"],
          where,
          _count: { _all: true },
        }),
        prisma.campaignMember.groupBy({
          by: ["campaing_id"],
          where,
          _count: { _all: true },
        }),
      ]);

      const campaigns = await prisma.campaing.findMany({
        where: { id: { in: byCampaign.map((c) => c.campaing_id) } },
        select: { id: true, name: true, platform: true, total_spent: true },
      });
      const campaignMap = new Map(campaigns.map((c) => [c.id, c]));

      const wonCount = byStatus.find((s) => s.status === "WON")?._count._all ?? 0;

      return {
        total_leads: totalLeads,
        conversion_rate: totalLeads > 0 ? round2((wonCount / totalLeads) * 100) : 0,
        leads_by_status: byStatus.map((s) => ({
          status: s.status,
          count: s._count._all,
        })),
        leads_by_source: bySource.map((s) => ({
          source: s.source,
          count: s._count._all,
        })),
        leads_by_campaign: byCampaign.map((c) => {
          const campaign = campaignMap.get(c.campaing_id);
          const spent = toNumber(campaign?.total_spent);
          return {
            campaign_id: c.campaing_id,
            campaign_name: campaign?.name ?? "Unknown",
            platform: campaign?.platform ?? null,
            lead_count: c._count._all,
            cost_per_lead:
              spent > 0 && c._count._all > 0 ? round2(spent / c._count._all) : null,
          };
        }),
      };
    },
    async sales(query: SalesReportQuery) {
      const { from, to, seller_id, campaign_id } = query;

      const where: Prisma.OrderWhereInput = {
        created_at: dateRangeFilter(from, to),
        ...(seller_id && { generated_by: seller_id }),
        ...(campaign_id && {
          lead: { campaignsEngaging: { some: { campaing_id: campaign_id } } },
        }),
      };

      const [totalOrders, byStatus, revenueAgg, bySeller] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.groupBy({
          by: ["order_status"],
          where,
          _count: { _all: true },
        }),
        prisma.order.aggregate({
          where: { ...where, order_status: "COMPLETED" },
          _sum: { total_amount: true },
          _avg: { total_amount: true },
        }),
        prisma.order.groupBy({
          by: ["generated_by"],
          where: { ...where, generated_by: { not: null } },
          _count: { _all: true },
          _sum: { total_amount: true },
        }),
      ]);

      const sellerIds = bySeller
        .map((s) => s.generated_by)
        .filter((id): id is string => id !== null);
      const sellers = await prisma.sellerProfile.findMany({
        where: { id: { in: sellerIds } },
        select: { id: true, user: { select: { first_name: true, last_name: true } } },
      });
      const sellerMap = new Map(sellers.map((s) => [s.id, s]));

      const completedCount =
        byStatus.find((s) => s.order_status === "COMPLETED")?._count._all ?? 0;
      const cancelledCount =
        byStatus.find((s) => s.order_status === "CANCELLED")?._count._all ?? 0;

      return {
        total_orders: totalOrders,
        total_revenue: toNumber(revenueAgg._sum.total_amount),
        average_order_value: round2(toNumber(revenueAgg._avg.total_amount)),
        completion_rate: totalOrders > 0 ? round2((completedCount / totalOrders) * 100) : 0,
        cancellation_rate: totalOrders > 0 ? round2((cancelledCount / totalOrders) * 100) : 0,
        orders_by_status: byStatus.map((s) => ({
          status: s.order_status,
          count: s._count._all,
        })),
        top_sellers: bySeller
          .map((s) => {
            const seller = sellerMap.get(s.generated_by!);
            return {
              seller_id: s.generated_by!,
              seller_name: seller
                ? `${seller.user.first_name} ${seller.user.last_name}`
                : "Unknown",
              order_count: s._count._all,
              revenue: toNumber(s._sum.total_amount),
            };
          })
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10),
      };
    },
    async collections(query: CollectionsReportQuery) {
      const { from, to } = query;

      const where: Prisma.ScheduledPaymentWhereInput = {
        due_date: dateRangeFilter(from, to),
      };

      const [byStatus, paidAgg] = await Promise.all([
        prisma.scheduledPayment.groupBy({
          by: ["status"],
          where,
          _count: { _all: true },
          _sum: { due_amount: true },
        }),
        prisma.payment.aggregate({
          where: {
            payment_date: dateRangeFilter(from, to),
            payment_status: "CONFIRMED",
          },
          _sum: { amount: true },
        }),
      ]);

      const overdue = byStatus.find((s) => s.status === "OVERDUE");
      const pending = byStatus.find((s) => s.status === "PENDING");
      const totalDue = byStatus.reduce((sum, s) => sum + toNumber(s._sum.due_amount), 0);
      const totalCollected = toNumber(paidAgg._sum.amount);

      return {
        total_collected: totalCollected,
        total_overdue: toNumber(overdue?._sum.due_amount),
        total_pending: toNumber(pending?._sum.due_amount),
        overdue_installments_count: overdue?._count._all ?? 0,
        collection_rate: totalDue > 0 ? round2((totalCollected / totalDue) * 100) : 0,
        installments_by_status: byStatus.map((s) => ({
          status: s.status,
          count: s._count._all,
          amount: toNumber(s._sum.due_amount),
        })),
      };
    },
    async meta(query: MetaReportQuery) {
      const { from, to, campaign_id } = query;

      const memberWhere: Prisma.CampaignMemberWhereInput = {
        meta_leadgen_id: { not: null },
        created_at: dateRangeFilter(from, to),
        ...(campaign_id && { campaing_id: campaign_id }),
      };

      const [totalMetaLeads, byCampaign, campaigns] = await Promise.all([
        prisma.campaignMember.count({ where: memberWhere }),
        prisma.campaignMember.groupBy({
          by: ["campaing_id"],
          where: memberWhere,
          _count: { _all: true },
        }),
        prisma.campaing.findMany({
          where: {
            meta_form_id: { not: null },
            ...(campaign_id && { id: campaign_id }),
          },
          select: {
            id: true,
            name: true,
            status: true,
            meta_campaign_id: true,
            meta_form_id: true,
            leads_last_synced_at: true,
          },
        }),
      ]);

      const countMap = new Map(byCampaign.map((c) => [c.campaing_id, c._count._all]));

      return {
        total_meta_leads: totalMetaLeads,
        campaigns: campaigns.map((c) => ({
          campaign_id: c.id,
          campaign_name: c.name,
          status: c.status,
          meta_campaign_id: c.meta_campaign_id,
          meta_form_id: c.meta_form_id,
          leads_ingested: countMap.get(c.id) ?? 0,
          last_synced_at: c.leads_last_synced_at,
        })),
      };
    },
  };
}