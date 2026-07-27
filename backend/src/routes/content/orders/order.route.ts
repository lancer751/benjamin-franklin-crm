import type { SuccessResponse } from "@/app";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import { CreateOrderSchema, OrderQuerySchema } from "shared";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import withPrisma from "@/lib/prisma";
import { orderRepository } from "@/repositories/order.repository";
import { HTTPException } from "hono/http-exception";

export const orderRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .get("/", zValidator("query", OrderQuerySchema), async (c) => {
    const repo = orderRepository(c.get("prisma"));
    const query = c.req.valid("query");
    const result = await repo.findMany(query);

    return c.json<SuccessResponse<typeof result>>(
      { success: true, message: "Orders retrieved", data: result },
      200,
    );
  })
  .post("/", zValidator("json", CreateOrderSchema), async (c) => {
    const {assigned_to, order_items, generated_by, lead_id, related_campaign} = c.req.valid("json");
    const prisma = c.get("prisma");
    const authUser = c.var.authUser

    // validate if campaign member has passed the selling pipeline
    const selectedCampaignMember = await prisma.campaignMember.findUniqueOrThrow({
      where: {
        lead_id_campaing_id: {
          lead_id,
          campaing_id: related_campaign,
        },
      },
      select: {
        status: true,
        id: true,
        assigned_to: true,
      }
    });

    if(authUser.role === "SALES_REP" && authUser.userId !== selectedCampaignMember.assigned_to) {
      throw new HTTPException(403, {message: "No puedes generar una orden para este vendedor"})
    }

    if(selectedCampaignMember.status !== "MATRICULADO") {
      throw new HTTPException(409, {message: "Estado de tipificación inválido para generar una orden"})
    }



    // await prisma.order.create({
    //   data: {
    //     lead_id,
    //     assigned_to,
    //     generated_by,
    //   }
    // })
  });
