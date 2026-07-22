import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import type { PrismaClient } from "@repo/database";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import withPrisma from "@/lib/prisma";
import {
  createPaymentSchema,
  UpdatePaymentSchema,
  UpdatePaymentStatusSchema,
} from "shared";
import {
  verifyUserAccessAuth,
  verifyUserRoleAccess,
} from "@/middlewares/auth.middleware";

const paymentInclude = {
  order: { include: { lead: true } },
  schedulePayment: true,
} as const;

async function assertOrderNotOverpaid(
  prisma: PrismaClient,
  orderId: string,
  incomingAmount: number,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, total_amount: true },
  });
  if (!order) {
    throw new HTTPException(404, { message: "Order not found" });
  }

  const confirmedPayments = await prisma.payment.findMany({
    where: { order_id: orderId, payment_status: "CONFIRMED" },
    select: { amount: true },
  });
  const alreadyPaid = confirmedPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0,
  );

  if (alreadyPaid + incomingAmount > Number(order.total_amount)) {
    throw new HTTPException(400, {
      message: "Payment would exceed the order's total amount",
    });
  }
}

export const paymentRoutes = new Hono<ContextWithPrisma>()
  .use(withPrisma)
  .use(verifyUserAccessAuth)
  // NOTE: adjust to your actual org chart — payments are money-moving,
  // so I've kept MARKETING out by default.
  .use(verifyUserRoleAccess("ADMIN", "SALES_REP", "SALES_SUPERVISOR"))

  .get("/", async (c) => {
    const payments = await c.get("prisma").payment.findMany({
      include: paymentInclude,
      orderBy: { created_at: "desc" },
    });

    return c.json<SuccessResponse<typeof payments>>(
      { success: true, message: "Payments retrieved", data: payments },
      200,
    );
  })

  .get(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.string().uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");

      const payment = await c.get("prisma").payment.findUnique({
        where: { id },
        include: {
          order: {
            include: {
              lead: true,
              paymentPlans: { include: { installments: true } },
            },
          },
          schedulePayment: true,
        },
      });

      if (!payment) {
        throw new HTTPException(404, { message: "Payment not found" });
      }

      return c.json<SuccessResponse<typeof payment>>(
        { success: true, data: payment, message: "Payment retrieved successfully" },
        200,
      );
    },
  )

  .post("/", zValidator("json", createPaymentSchema), async (c) => {
    const prisma = c.get("prisma");
    const paymentData = c.req.valid("json");
    const { payment_plan: paymentPlan, ...newPaymentData } =
      structuredClone(paymentData);

    const amount = Number(newPaymentData.amount);

    // Only block overpayment for money that's actually confirmed — a FAILED
    // payment shouldn't count against the order's balance.
    if (newPaymentData.payment_status === "CONFIRMED") {
      await assertOrderNotOverpaid(prisma, newPaymentData.order_id, amount);
    } else {
      const order = await prisma.order.findUnique({
        where: { id: newPaymentData.order_id },
        select: { id: true },
      });
      if (!order) {
        throw new HTTPException(404, { message: "Order not found" });
      }
    }

    let scheduledPaymentId: string | null = null;

    if (paymentData.type === "INSTALLMENTS" && paymentPlan) {
      const { scheduled_payments, ...paymentPlanData } = paymentPlan;

      const result = await prisma.$transaction(async (tx) => {
        const plan = await tx.paymentPlan.create({
          data: { ...paymentPlanData, order_id: newPaymentData.order_id },
        });

        await tx.scheduledPayment.createMany({
          data: scheduled_payments.map((inst, index) => ({
            ...inst,
            payment_plan_id: plan.id,
            number: index + 1,
          })),
        });

        const firstScheduledPayment = await tx.scheduledPayment.findUnique({
          where: {
            payment_plan_id_number: { number: 1, payment_plan_id: plan.id },
          },
        });

        if (!firstScheduledPayment) {
          throw new HTTPException(404, {
            message: "First scheduled payment not found",
          });
        }

        // Mark the covered installment as paid — this was previously
        // missing, which left the schedule permanently out of sync with
        // reality after the very first payment.
        if (newPaymentData.payment_status === "CONFIRMED") {
          await tx.scheduledPayment.update({
            where: { id: firstScheduledPayment.id },
            data: { status: "PAID" },
          });
        }

        return firstScheduledPayment;
      });

      scheduledPaymentId = result.id;
    }

    const generatedPayment = await prisma.payment.create({
      data: { ...newPaymentData, scheduled_payment_id: scheduledPaymentId },
      include: paymentInclude,
    });

    return c.json<SuccessResponse<typeof generatedPayment>>(
      {
        success: true,
        message: "Payment created successfully",
        data: generatedPayment,
      },
      201,
    );
  })

  .put(
    UUID_ROUTE,
    zValidator("param", z.object({ id: z.string().uuid().length(36) })),
    zValidator("json", UpdatePaymentSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const updateData = c.req.valid("json");

      const existingPayment = await c
        .get("prisma")
        .payment.findUnique({ where: { id } });

      if (!existingPayment) {
        throw new HTTPException(404, { message: "Payment not found" });
      }

      // payment_status can no longer sneak in here — UpdatePaymentSchema
      // doesn't include it, so this genuinely only touches safe fields now.
      const updatedPayment = await c.get("prisma").payment.update({
        where: { id },
        data: updateData,
        include: paymentInclude,
      });

      return c.json<SuccessResponse<typeof updatedPayment>>(
        {
          success: true,
          message: "Payment updated successfully",
          data: updatedPayment,
        },
        200,
      );
    },
  )

  // Dedicated, restricted endpoint for the one field that actually affects
  // the sales pipeline. Keep this away from SALES_REP — refunds/confirmations
  // should go through someone with oversight.
  .patch(
    "/:id/status",
    verifyUserRoleAccess("ADMIN", "SALES_SUPERVISOR"),
    zValidator("param", z.object({ id: z.string().uuid().length(36) })),
    zValidator("json", UpdatePaymentStatusSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const { payment_status } = c.req.valid("json");
      const prisma = c.get("prisma");

      const existingPayment = await prisma.payment.findUnique({
        where: { id },
        select: {
          id: true,
          payment_status: true,
          order_id: true,
          amount: true,
          scheduled_payment_id: true,
        },
      });

      if (!existingPayment) {
        throw new HTTPException(404, { message: "Payment not found" });
      }

      if (existingPayment.payment_status === payment_status) {
        throw new HTTPException(400, {
          message: `Payment is already ${payment_status}`,
        });
      }

      if (
        existingPayment.payment_status === "REFUNDED" ||
        existingPayment.payment_status === "FAILED"
      ) {
        throw new HTTPException(400, {
          message: `Cannot change status of a ${existingPayment.payment_status} payment`,
        });
      }

      // Moving CONFIRMED → CONFIRMED-derived paths would exceed the order
      // total if we're re-confirming; only re-check when moving TO confirmed.
      if (payment_status === "CONFIRMED") {
        await assertOrderNotOverpaid(
          prisma,
          existingPayment.order_id,
          Number(existingPayment.amount),
        );
      }

      const updatedPayment = await prisma.$transaction(async (tx) => {
        const updated = await tx.payment.update({
          where: { id },
          data: { payment_status },
          include: paymentInclude,
        });

        if (existingPayment.scheduled_payment_id) {
          await tx.scheduledPayment.update({
            where: { id: existingPayment.scheduled_payment_id },
            data: { status: payment_status === "CONFIRMED" ? "PAID" : "PENDING" },
          });
        }

        return updated;
      });

      return c.json<SuccessResponse<typeof updatedPayment>>(
        {
          success: true,
          message: "Payment status updated successfully",
          data: updatedPayment,
        },
        200,
      );
    },
  )

  .delete(
    UUID_ROUTE,
    verifyUserRoleAccess("ADMIN", "SALES_SUPERVISOR"),
    zValidator("param", z.object({ id: z.string().uuid().length(36) })),
    async (c) => {
      const { id } = c.req.valid("param");

      const existingPayment = await c
        .get("prisma")
        .payment.findUnique({ where: { id } });

      if (!existingPayment) {
        throw new HTTPException(404, { message: "Payment not found" });
      }

      if (existingPayment.payment_status === "CONFIRMED") {
        throw new HTTPException(400, {
          message: "Cannot delete confirmed payments. Create a refund instead.",
        });
      }

      await c.get("prisma").payment.delete({ where: { id } });

      return c.json<SuccessResponse>(
        { success: true, message: "Payment deleted successfully" },
        200,
      );
    },
  );