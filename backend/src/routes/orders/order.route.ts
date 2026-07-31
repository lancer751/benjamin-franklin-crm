import type { SuccessResponse } from "@/app";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import { CreateOrderSchema, OrderQuerySchema } from "shared";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import withPrisma from "@/lib/prisma";
import { orderRepository } from "@/repositories/order.repository";
import { HTTPException } from "hono/http-exception";
import {
  generateUniqueOrderCode,
  orderItemsRecordData,
} from "./handlers/order.handler";

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
    const { lead_id, related_campaign, ...rest } = c.req.valid("json");
    const prisma = c.get("prisma");
    const authUser = c.var.authUser;

    // validate if campaign member has passed the selling pipeline
    const selectedCampaignMember =
      await prisma.campaignMember.findUniqueOrThrow({
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
        },
      });

    if (
      authUser.role === "SALES_REP" &&
      authUser.userId !== selectedCampaignMember.assigned_to
    ) {
      throw new HTTPException(403, {
        message: "No puedes generar una orden para este vendedor",
      });
    }

    if (selectedCampaignMember.status !== "MATRICULADO") {
      throw new HTTPException(409, {
        message: "Estado de tipificación inválido para generar una orden",
      });
    }

    const { codesUsed, discountTotal, subtotal, totalAmount, resolvedItems } =
      await orderItemsRecordData(prisma, rest.order_items);

    const orderCode = await generateUniqueOrderCode(prisma);

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          order_code: orderCode,
          lead_id,
          sub_total: subtotal,
          total_amount: totalAmount,
          assigned_to: rest.assigned_to,
          generated_by: rest.generated_by,
          discount: discountTotal,
          orderDetails: { createMany: { data: resolvedItems } },
        },
        include: {
          orderDetails: true,
          assignedUser: true
        }
      });

      // Increment usage inside the same transaction so two concurrent orders
      // can't both slip past a max_uses check.
      for (const code of codesUsed) {
        await tx.discountCode.update({
          where: { code },
          data: { times_used: { increment: 1 } },
        });
      }

      return created;
    });

    return c.json<SuccessResponse<typeof order>>(
      { success: true, message: "Order created successfully", data: order },
      201,
    );
  });
