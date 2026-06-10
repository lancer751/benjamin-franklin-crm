import type { PrismaClient } from "@repo/database";
import type {
  CreateCampaignInput,
  UpdateCampaignInput,
  AssignSellersInput,
  CampaignQuery,
} from "shared"

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

      const [data, total] = await Promise.all([
        prisma.campaing.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            relatedProduct: {
              select: { id: true, name: true, sales_status: true },
            },
            supervisor: {
              select: {
                id: true,
                user: { select: { first_name: true, last_name: true } },
              },
            },
            sellers: {
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
            _count: { select: { members: true } },
          },
        }),
        prisma.campaing.count({ where }),
      ]);

      return { data, total, page, limit };
    },

    async findById(id: string) {
      return prisma.campaing.findUnique({
        where: { id },
        include: {
          relatedProduct: {
            select: {
              id: true,
              name: true,
              sales_status: true,
              prices: { select: { attendance_mode: true, cash_price: true } },
            },
          },
          supervisor: {
            select: {
              id: true,
              user: {
                select: { first_name: true, last_name: true, email: true },
              },
            },
          },
          sellers: {
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
          _count: { select: { members: true, leads: true } },
        },
      });
    },

    // ── Write ───────────────────────────────────────────────────────────────

    async create(data: CreateCampaignInput) {
      // Verify product exists and is publishable
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

      // Verify supervisor exists
      const supervisor = await prisma.salesSupervisorProfile.findUnique({
        where: { id: data.supervisor_id },
        select: { id: true },
      });
      if (!supervisor)
        throw { code: "NOT_FOUND", message: "Supervisor not found" };

      return prisma.campaing.create({
        data: {
          campaing_name: data.campaing_name,
          initial_budget: data.initial_budget,
          start_date: data.start_date,
          end_date: data.end_date,
          platform: data.platform,
          is_organic: data.is_organic,
          status: data.status,
          meta_form_id: data.meta_form_id,
          relatedProduct: { connect: { id: data.product_id } },
          supervisor: { connect: { id: data.supervisor_id } },
        },
        include: {
          relatedProduct: { select: { id: true, name: true } },
          supervisor: {
            select: {
              id: true,
              user: { select: { first_name: true, last_name: true } },
            },
          },
        },
      });
    },

    async update(id: string, data: UpdateCampaignInput) {
      const { product_id, supervisor_id, ...rest } = data;
      return prisma.campaing.update({
        where: { id },
        data: {
          ...rest,
          ...(product_id && {
            relatedProduct: { connect: { id: product_id } },
          }),
          ...(supervisor_id && {
            supervisor: { connect: { id: supervisor_id } },
          }),
        },
      });
    },

    async delete(id: string) {
      // Block deletion if campaign has members (leads have been assigned)
      const campaign = await prisma.campaing.findUnique({
        where: { id },
        select: { _count: { select: { members: true } } },
      });
      if (!campaign) throw { code: "NOT_FOUND", message: "Campaign not found" };
      if (campaign._count.members > 0)
        throw {
          code: "CONFLICT",
          message:
            "Cannot delete a campaign that already has leads. Set status to INACTIVE instead.",
        };

      return prisma.campaing.delete({ where: { id } });
    },

    // ── Seller assignment ───────────────────────────────────────────────────

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
          sellers: {
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