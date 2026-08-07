import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import type { PrismaClient } from "@repo/database";
import type { SuccessResponse } from "@/app";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import { CreatePaymentScheduleSchema } from "shared";
import { verifyUserRoleAccess } from "@/middlewares/auth.middleware";
import { paymentPlanRepository } from "@/repositories/payment-plan.repository";

// :id aquí es el order id, heredado del prefijo del router padre — ver order.route.ts
const ParamsSchema = z.object({
    id: z.uuid().length(36),
    detailId: z.uuid().length(36),
});

async function assertOrderAccess(prisma: PrismaClient, orderId: string, authUser: { role: string; userId: string }) {
    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true, assigned_to: true } });
    if (!order) throw new HTTPException(404, { message: "Order not found" });
    if (authUser.role === "SALES_REP" && order.assigned_to !== authUser.userId) {
        throw new HTTPException(403, { message: "No tienes acceso a esta orden" });
    }
}

export const paymentPlanRoutes = new Hono<ContextWithPrisma>()
    // withPrisma / verifyUserAccessAuth / verifyUserRoleAccess ya los aplica
    // orderRoutes como padre — no se repiten aquí.
    .get("/", zValidator("param", ParamsSchema), async (c) => {
        const { id, detailId } = c.req.valid("param");
        await assertOrderAccess(c.get("prisma"), id, c.var.authUser);
        const plan = await paymentPlanRepository(c.get("prisma")).findByDetail(id, detailId);
        return c.json<SuccessResponse<typeof plan>>({ success: true, message: "Payment schedule retrieved", data: plan }, 200);
    })

    .post("/", verifyUserRoleAccess("ADMIN", "SALES_REP", "SALES_SUPERVISOR"), zValidator("param", ParamsSchema), zValidator("json", CreatePaymentScheduleSchema), async (c) => {
        const { id, detailId } = c.req.valid("param");
        await assertOrderAccess(c.get("prisma"), id, c.var.authUser);
        const plan = await paymentPlanRepository(c.get("prisma")).create(id, detailId, c.req.valid("json"));
        return c.json<SuccessResponse<typeof plan>>({ success: true, message: "Payment schedule created", data: plan }, 201);
    })

    .put("/", verifyUserRoleAccess("ADMIN", "SALES_REP", "SALES_SUPERVISOR"), zValidator("param", ParamsSchema), zValidator("json", CreatePaymentScheduleSchema), async (c) => {
        const { id, detailId } = c.req.valid("param");
        await assertOrderAccess(c.get("prisma"), id, c.var.authUser);
        const plan = await paymentPlanRepository(c.get("prisma")).replace(id, detailId, c.req.valid("json"));
        return c.json<SuccessResponse<typeof plan>>({ success: true, message: "Payment schedule updated", data: plan }, 200);
    })

    .delete("/", verifyUserRoleAccess("ADMIN", "SALES_SUPERVISOR"), zValidator("param", ParamsSchema), async (c) => {
        const { id, detailId } = c.req.valid("param");
        await assertOrderAccess(c.get("prisma"), id, c.var.authUser);
        await paymentPlanRepository(c.get("prisma")).cancel(id, detailId);
        return c.json<SuccessResponse>({ success: true, message: "Payment schedule cancelled" }, 200);
    });
