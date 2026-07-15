import { syncMetaLeadsForCampaign } from "@/services/leadgenProcessor";
import type { PrismaClient } from "@repo/database";
import type {
  CreateCampaignInput,
  UpdateCampaignInput,
  AssignSellersInput,
  CampaignQuery,
} from "shared";

export function campaignRepository(prisma: PrismaClient) {
  return {
    // ── Read ────────────────────────────────────────────────────────────────

    async findMany({ page, limit, status, platform, search }: CampaignQuery) {
      const skip = (page - 1) * limit;
      const where = {
        ...(status && { status }),
        ...(platform && { platform }),
        ...(search && {
          campaing_name: { contains: search, mode: "insensitive" as const },
        }),
      };

      const [campaings, total] = await Promise.all([
        prisma.campaing.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            relatedProduct: {
              select: { id: true, name: true, sales_status: true },
            },
            assignedSupervisor: {
              select: {
                id: true,
                user: { select: { first_name: true, last_name: true } },
              },
            },
            sellersOnCampaign: {
              select: {
                seller_id: true,
                assigned_at: true,
                seller: {
                  select: {
                    user: { select: { first_name: true, last_name: true } },
                  },
                },
              },
            },
            _count: {
              select: { leadsOnCampaign: true, sellersOnCampaign: true },
            },
          },
        }),
        prisma.campaing.count({ where }),
      ]);

      return { campaings, total, page, limit };
    },

    async findById(id: string) {
      return prisma.campaing.findUnique({
        where: { id },
        include: {
          relatedProduct: {
            select: {
              name: true,
              sales_status: true,
              prices: { select: { attendance_mode: true, cash_price: true } },
            },
          },
          assignedSupervisor: {
            select: {
              user: {
                select: { first_name: true, last_name: true, email: true },
              },
            },
          },
          sellersOnCampaign: {
            include: {
              seller: {
                select: {
                  id: true,
                  total_orders: true,
                  user: { select: { first_name: true, last_name: true } },
                },
              },
            },
          },
          _count: {
            select: { leadsOnCampaign: true, sellersOnCampaign: true },
          },
        },
      });
    },
    async create(data: CreateCampaignInput) {
      const product = await prisma.product.findUnique({
        where: { id: data.product_id },
        select: {
          id: true,
          sales_status: true,
          campaing: { select: { id: true } },
        },
      });
      if (!product) throw { code: "NOT_FOUND", message: "Product not found" };
      if (product.campaing)
        throw {
          code: "CONFLICT",
          message: "Product already has a campaign linked",
        };
      if (!["PUBLISHED", "ON_SALE"].includes(product.sales_status))
        throw {
          code: "INVALID",
          message: "Only PUBLISHED or ON_SALE products can have a campaign",
        };

      const supervisor = await prisma.salesSupervisorProfile.findUnique({
        where: { id: data.supervisor_id },
        select: { id: true },
      });
      if (!supervisor)
        throw { code: "NOT_FOUND", message: "Supervisor not found" };

      const sellers = await prisma.sellerProfile.findMany({
        where: { id: { in: data.seller_ids } },
        select: { id: true },
      });
      if (sellers.length !== data.seller_ids.length)
        throw { code: "NOT_FOUND", message: "One or more sellers not found" };

      return prisma.$transaction(async (tx) => {
        const campaign = await tx.campaing.create({
          data: {
            name: data.name,
            initial_budget: data.initial_budget,
            start_date: data.start_date,
            end_date: data.end_date,
            platform: data.platform,
            is_organic: data.is_organic,
            status: data.status,
            meta_campaign_id: data.meta_campaign_id,
            meta_form_id: data.meta_form_id,
            click_to_whatsapp: data.click_to_whatsapp,
            whatsapp_number: data.whatsapp_number,
            relatedProduct: { connect: { id: data.product_id } },
            assignedSupervisor: { connect: { id: data.supervisor_id } },
          },
        });

        await tx.campaignSeller.createMany({
          data: data.seller_ids.map((seller_id) => ({
            campaign_id: campaign.id,
            seller_id,
          })),
        });

        return tx.campaing.findUniqueOrThrow({
          where: { id: campaign.id },
          include: {
            relatedProduct: { select: { id: true, name: true } },
            sellersOnCampaign: {
              include: {
                seller: {
                  select: {
                    id: true,
                    user: { select: { first_name: true, last_name: true } },
                  },
                },
              },
            },
          },
        });
      });
    },

    async update(id: string, data: UpdateCampaignInput) {
      const current = await prisma.campaing.findUnique({
        where: { id },
        select: {
          status: true,
          meta_form_id: true,
          leads_last_synced_at: true,
          start_date: true,
        },
      });
      if (!current) throw { code: "NOT_FOUND", message: "Campaign not found" };

      const { product_id, supervisor_id, ...rest } = data;

      if (rest.status === "ACTIVE") {
        // Check if campaign has at least one seller assigned before activating
        const sellersCount = await prisma.campaignSeller.count({
          where: { campaign_id: id },
        });
        if (sellersCount === 0) {
          throw {
            code: "INVALID",
            message: "Cannot activate a campaign without sellers assigned",
          };
        }
      }

      // verify if the product and the supervisor exist if they are being updated
      if (product_id) {
        const product = await prisma.product.findUnique({
          where: { id: product_id },
          select: { id: true, sales_status: true },
        });
        if (!product) throw { code: "NOT_FOUND", message: "Product not found" };
        if (!["PUBLISHED", "ON_SALE"].includes(product.sales_status))
          throw {
            code: "INVALID",
            message: "Only PUBLISHED or ON_SALE products can have a campaign",
          };
      }

      if (supervisor_id) {
        const supervisor = await prisma.salesSupervisorProfile.findUnique({
          where: { id: supervisor_id },
          select: { id: true },
        });
        if (!supervisor)
          throw { code: "NOT_FOUND", message: "Supervisor not found" };
      }

      // verify if the incoming product id is not already linked to another campaign
      if (product_id) {
        const existing = await prisma.campaing.findFirst({
          where: {
            relatedProduct: { id: product_id },
            id: { not: id },
          },
        });
        if (existing)
          throw {
            code: "CONFLICT",
            message: "Product already has a campaign linked",
          };
      }

      // verify if meta_form_id is an existing form from meta

      const updated = prisma.campaing.update({
        where: { id },
        data: {
          ...rest,
          ...(product_id && {
            relatedProduct: { connect: { id: product_id } },
          }),
          ...(supervisor_id && {
            assignedSupervisor: { connect: { id: supervisor_id } },
          }),
        },
      });

      const isReactivating =
        current.status !== "ACTIVE" && data.status === "ACTIVE";
      if (isReactivating && current.meta_form_id) {
        // Fire-and-forget — don't block the response on Meta's API latency.
        // Log failures; this can also be safely re-run manually via the endpoint below.
        syncMetaLeadsForCampaign(prisma, id).catch((err) =>
          console.error("Catch-up sync failed for campaign", id, err),
        );
      }

      return updated;
    },

    async delete(id: string) {
      // Block deletion if campaign has members (leads have been assigned)
      const campaign = await prisma.campaing.findUnique({
        where: { id },
        select: {
          _count: {
            select: { leadsOnCampaign: true, sellersOnCampaign: true },
          },
        },
      });
      if (!campaign) throw { code: "NOT_FOUND", message: "Campaign not found" };
      if (
        campaign._count.leadsOnCampaign > 0 ||
        campaign._count.sellersOnCampaign > 0
      )
        throw {
          code: "CONFLICT",
          message:
            "Cannot delete a campaign that already has leads or sellers. Set status to INACTIVE instead.",
        };

      return prisma.campaing.delete({ where: { id } });
    },

    // ── Seller assignment

    async assignSellers(
      campaignId: string,
      { seller_ids }: AssignSellersInput,
    ) {
      // Verify all sellers exist
      const found = await prisma.sellerProfile.findMany({
        where: { id: { in: seller_ids } },
        select: { id: true },
      });
      if (found.length !== seller_ids.length) {
        const foundIds = new Set(found.map((s) => s.id));
        const missing = seller_ids.filter((id) => !foundIds.has(id));
        throw {
          code: "NOT_FOUND",
          message: `Seller IDs not found: ${missing.join(", ")}`,
        };
      }

      // checking if there are inactive sellers being assigned to a campaign
      const inactiveSellers = await prisma.sellerProfile.findMany({
        where: { id: { in: seller_ids }, user: { is_active: false } },
        select: { id: true },
      });
      if (inactiveSellers.length > 0) {
        const inactiveIds = inactiveSellers.map((s) => s.id);
        throw {
          code: "INVALID",
          message: `Cannot assign inactive sellers to campaign. Inactive seller IDs: ${inactiveIds.join(
            ", ",
          )}`,
        };
      }

      // Upsert — safe to call multiple times (idempotent)
      await prisma.campaignSeller.createMany({
        data: seller_ids.map((seller_id) => ({
          campaign_id: campaignId,
          seller_id,
        })),
        skipDuplicates: true,
      });

      return prisma.campaing.findUniqueOrThrow({
        where: { id: campaignId },
        include: {
          sellersOnCampaign: {
            include: {
              seller: {
                select: {
                  id: true,
                  user: { select: { first_name: true, last_name: true } },
                },
              },
            },
          },
        },
      });
    },

    async removeSeller(campaignId: string, sellerId: string) {
      return prisma.campaignSeller.delete({
        where: {
          campaign_id_seller_id: {
            campaign_id: campaignId,
            seller_id: sellerId,
          },
        },
      });
    },
  };
}
