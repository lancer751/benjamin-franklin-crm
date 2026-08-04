import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import type { SuccessResponse } from "@/app";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import withPrisma from "@/lib/prisma";
import { verifyUserAccessAuth, verifyUserRoleAccess } from "@/middlewares/auth.middleware";
import { CreateOrderSchema, UpdateOrderSchema, OrderQuerySchema } from "shared";
import { orderItemsRecordData, generateUniqueOrderCode, updateOrderItems } from "./handlers/order.handler";
import { orderRepository } from "@/repositories/order.repository";

const UUIDParam = z.object({ id: z.string().uuid().length(36) });

export const orderRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .use(verifyUserAccessAuth)
  .use(verifyUserRoleAccess("ADMIN", "SALES_REP", "SALES_SUPERVISOR", "MARKETING", "COLLECTIONS"))

  .get("/", zValidator("query", OrderQuerySchema), async (c) => {
    const result = await orderRepository(c.get("prisma")).findMany(c.req.valid("query"));
    return c.json<SuccessResponse<typeof result>>({ success: true, message: "Orders retrieved", data: result }, 200);
  })
  .get("/:id", zValidator("param", UUIDParam), async (c) => {
    const order = await orderRepository(c.get("prisma")).findById(c.req.valid("param").id);
    return c.json<SuccessResponse<typeof order>>({ success: true, message: "Order retrieved", data: order }, 200);
  })
  .post(
    "/",
    verifyUserRoleAccess("ADMIN", "SALES_REP", "SALES_SUPERVISOR"),
    zValidator("json", CreateOrderSchema),
    async (c) => {
      const { member_id, related_campaign, assigned_to, order_items } = c.req.valid("json");
      const prisma = c.get("prisma");
      const authUser = c.var.authUser;

      const member = await prisma.campaignMember.findFirst({
        where: { id: member_id, campaing_id: related_campaign },
        select: { id: true, status: true, assigned_to: true },
      });
      if (!member) throw new HTTPException(404, { message: "Miembro de campaña no encontrado" });

      if (authUser.role === "SALES_REP" && authUser.userId !== member.assigned_to) {
        throw new HTTPException(403, { message: "No puedes generar una orden para este vendedor" });
      }
      if (member.status !== "MATRICULADO") {
        throw new HTTPException(409, { message: "Estado de tipificación inválido para generar una orden" });
      }

      let resolvedAssignedTo = member.assigned_to;
      if (authUser.role === "SALES_REP") {
        resolvedAssignedTo = authUser.userId;
      } else if (assigned_to) {
        const target = await prisma.user.findUnique({ where: { id: assigned_to }, select: { id: true, is_active: true } });
        if (!target?.is_active) throw new HTTPException(404, { message: "Usuario asignado no encontrado o inactivo" });
        resolvedAssignedTo = assigned_to;
      }

      const { codesUsed, discountTotal, subtotal, totalAmount, resolvedItems } = await orderItemsRecordData(prisma, order_items);
      const orderCode = await generateUniqueOrderCode(prisma);

      const order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            order_code: orderCode,
            member_id,
            sub_total: subtotal,
            total_amount: totalAmount,
            discount: discountTotal,
            generated_by: authUser.userId,
            assigned_to: resolvedAssignedTo,
            orderDetails: { createMany: { data: resolvedItems } },
          },
          include: { orderDetails: true, assignedUser: true },
        });
        for (const discountCodeId of codesUsed) {
          await tx.discountCode.update({ where: { id: discountCodeId }, data: { times_used: { increment: 1 } } });
        }
        return created;
      });

      return c.json<SuccessResponse<typeof order>>({ success: true, message: "Order created successfully", data: order }, 201);
    },
  )

  .put(
    "/:id",
    verifyUserRoleAccess("ADMIN", "SALES_REP", "SALES_SUPERVISOR"),
    zValidator("param", UUIDParam),
    zValidator("json", UpdateOrderSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const { order_status, assigned_to, order_items } = c.req.valid("json");
      const prisma = c.get("prisma");
      const repo = orderRepository(prisma);

      let order;
      if (order_items) order = await updateOrderItems(prisma, id, order_items);
      if (assigned_to) order = await repo.updateAssignment(id, assigned_to);
      if (order_status) order = await repo.updateStatus(id, order_status);

      return c.json<SuccessResponse<typeof order>>({ success: true, message: "Order updated successfully", data: order }, 200);
    },
  )
  .delete(
    "/:id",
    verifyUserRoleAccess("ADMIN", "SALES_SUPERVISOR"),
    zValidator("param", UUIDParam),
    async (c) => {
      const order = await orderRepository(c.get("prisma")).cancel(c.req.valid("param").id);
      return c.json<SuccessResponse<typeof order>>({ success: true, message: "Order cancelled", data: order }, 200);
    },
  );