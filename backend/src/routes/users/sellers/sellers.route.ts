import type { SuccessResponse } from "@/app";
import { validateIdParamSchema } from "@/helpers/params-validator";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { verifyUserRoleAccess } from "@/middlewares/auth.middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { UpdateSellerProfileSchema } from "shared";

export const sellersRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .get("/", async (c) => {
  const prisma = c.get("prisma");

  const sellers = await prisma.sellerProfile.findMany({
    select: {
      id: true,
      user_id: true,
      sales_target: true,
      total_sales: true,
      total_orders: true,
      completed_orders: true,
      canceled_orders: true,
      return_rate: true,
      response_time_avg: true,
      assigned_supervisor_id: true,

      user: {
        select: {
          id: true,
          first_name: true,
          middle_name: true,
          last_name: true,
          email: true,
          corporate_email: true,
          cellphone: true,
          corporate_cellphone: true,
          is_active: true,
          updated_at: true,
        },
      },

      assignedCampaing: {
        select: {
          campaign_id: true,
          campaign: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      },
    },

    orderBy: {
      total_sales: "desc",
    },
  });

  const sellerUserIds = sellers.map((seller) => seller.user_id);

  const campaignMemberMetrics = sellerUserIds.length
    ? await prisma.campaignMember.groupBy({
        by: ["assigned_to", "status"],
        where: {
          assigned_to: {
            in: sellerUserIds,
          },
        },
        _count: {
          _all: true,
        },
      })
    : [];

  const metricsBySeller = new Map<
    string,
    {
      total_leads: number;
      total_matriculated: number;
    }
  >();

  for (const metric of campaignMemberMetrics) {
    if (!metric.assigned_to) continue;

    const current = metricsBySeller.get(metric.assigned_to) ?? {
      total_leads: 0,
      total_matriculated: 0,
    };

    current.total_leads += metric._count._all;

    if (metric.status === "MATRICULADO") {
      current.total_matriculated += metric._count._all;
    }

    metricsBySeller.set(metric.assigned_to, current);
  }

  const data = sellers.map((seller) => {
    const metrics = metricsBySeller.get(seller.user_id) ?? {
      total_leads: 0,
      total_matriculated: 0,
    };

    return {
      ...seller,
      metrics,
    };
  });

  return c.json(
    {
      success: true,
      data,
    },
    200,
  );
})
  .get(
    "/:id/campaigns",
    zValidator("param", validateIdParamSchema),
    async (c) => {
      const sellerProfileId = c.req.valid("param").id;

      const result = await c.get("prisma").sellerProfile.findUnique({
        where: { id: sellerProfileId },
        select: {
          assignedCampaing: {
            include: { campaign: true },
          },
        },
      });

      return c.json(result, 200);
    },
  )
  // Get seller details by ID
  .get("/:id", zValidator("param", validateIdParamSchema), async (c) => {
  const { id: userID } = c.req.valid("param");
  const prisma = c.get("prisma");

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: {
      user_id: userID,
    },
    select: {
      id: true,
      user_id: true,
      sales_target: true,
      total_sales: true,
      total_orders: true,
      completed_orders: true,
      canceled_orders: true,
      return_rate: true,
      response_time_avg: true,
      assigned_supervisor_id: true,

      user: {
        select: {
          id: true,
          first_name: true,
          middle_name: true,
          last_name: true,
          email: true,
          corporate_email: true,
          cellphone: true,
          corporate_cellphone: true,
          is_active: true,
        },
      },

      assignedCampaing: {
        select: {
          assigned_at: true,
          campaign: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!sellerProfile) {
    throw new HTTPException(404, {
      message: "Seller profile not found",
    });
  }

  const [statusRows, campaignRows, orderRows] = await Promise.all([
    prisma.campaignMember.groupBy({
      by: ["status"],
      where: {
        assigned_to: userID,
      },
      _count: {
        _all: true,
      },
    }),

    prisma.campaignMember.groupBy({
      by: ["campaing_id", "status"],
      where: {
        assigned_to: userID,
      },
      _count: {
        _all: true,
      },
    }),

    prisma.order.groupBy({
      by: ["order_status"],
      where: {
        assigned_to: userID,
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  const statusBreakdown = {
    NUEVO: 0,
    CONTACTADO: 0,
    NO_CONTACTADO: 0,
    NEGOCIACION: 0,
    SEGUIMIENTO: 0,
    EN_ESPERA: 0,
    MATRICULADO: 0,
    PERDIDO: 0,
  };

  for (const row of statusRows) {
    statusBreakdown[row.status] = row._count._all;
  }

  const totalLeads = statusRows.reduce(
    (total, row) => total + row._count._all,
    0,
  );

  const totalMatriculated = statusBreakdown.MATRICULADO;

  const conversionRate =
    totalLeads > 0
      ? Number(((totalMatriculated / totalLeads) * 100).toFixed(2))
      : 0;

  const campaignMetricsById = new Map<
    string,
    {
      totalLeads: number;
      totalMatriculated: number;
    }
  >();

  for (const row of campaignRows) {
    const current = campaignMetricsById.get(row.campaing_id) ?? {
      totalLeads: 0,
      totalMatriculated: 0,
    };

    current.totalLeads += row._count._all;

    if (row.status === "MATRICULADO") {
      current.totalMatriculated += row._count._all;
    }

    campaignMetricsById.set(row.campaing_id, current);
  }

  const assignedCampaigns = sellerProfile.assignedCampaing.map(
    ({ assigned_at, campaign }) => {
      const metrics = campaignMetricsById.get(campaign.id) ?? {
        totalLeads: 0,
        totalMatriculated: 0,
      };

      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        assigned_at,
        metrics: {
          total_leads: metrics.totalLeads,
          total_matriculated: metrics.totalMatriculated,
          conversion_rate:
            metrics.totalLeads > 0
              ? Number(
                  (
                    (metrics.totalMatriculated / metrics.totalLeads) *
                    100
                  ).toFixed(2),
                )
              : 0,
        },
      };
    },
  );

  const totalOrders = orderRows.reduce(
    (total, row) => total + row._count._all,
    0,
  );

  const completedOrders =
    orderRows.find((row) => row.order_status === "COMPLETED")
      ?._count._all ?? 0;

  const response = {
    seller: {
      seller_profile_id: sellerProfile.id,
      user_id: sellerProfile.user_id,
      ...sellerProfile.user,
    },

    metrics: {
      sales_target: sellerProfile.sales_target,
      total_sales: sellerProfile.total_sales,
      total_leads: totalLeads,
      total_matriculated: totalMatriculated,
      conversion_rate: conversionRate,
      total_orders: totalOrders,
      completed_orders: completedOrders,
      active_campaigns: assignedCampaigns.filter(
        (campaign) => campaign.status === "ACTIVE",
      ).length,
    },

    lead_status_breakdown: statusBreakdown,
    assigned_campaigns: assignedCampaigns,
  };

  return c.json<SuccessResponse<typeof response>>(
    {
      success: true,
      message: "Seller profile retrieved successfully",
      data: response,
    },
    200,
  );
})
  .put(
    "/:id",
    withPrisma,
    verifyUserRoleAccess("ADMIN"),
    zValidator("param", validateIdParamSchema),
    zValidator("json", UpdateSellerProfileSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const sellerData = c.req.valid("json");

      const existingSellerProfile = await c
        .get("prisma")
        .sellerProfile.findUnique({
          where: { id },
        });

      if (!existingSellerProfile) {
        throw new HTTPException(404, { message: "Seller profile not found" });
      }

      const updatedSellerProfile = await c.get("prisma").sellerProfile.update({
        where: { id },
        data: sellerData,
        include: {
          user: true,
        },
      });

      return c.json<SuccessResponse<typeof updatedSellerProfile>>(
        {
          success: true,
          message: "Seller profile updated successfully",
          data: updatedSellerProfile,
        },
        200,
      );
    },
  );