import type { SuccessResponse } from "@/app";
import { UUID_ROUTE } from "@/helpers/constants";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import withPrisma from "@/lib/prisma";
import { createPaymentSchema, UpdatePaymentSchema } from "shared";

export const paymentRoutes = new Hono<ContextWithPrisma>()
  // Get all payments
  .get("/", withPrisma, async (c) => {
    const payments = await c.get("prisma").payment.findMany({
      include: {
        order: {
          include: {
            lead: true,
          },
        },
        schedulePayment: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return c.json(
      {
        success: true,
        data: payments,
      },
      200
    );
  })
  // Get payment by ID
  .get(UUID_ROUTE, withPrisma, async (c) => {
    const { id } = c.req.param();

    const payment = await c.get("prisma").payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            lead: true,
            paymentPlans: {
              include: {
                installments: true,
              },
            },
          },
        },
        schedulePayment: true,
      },
    });

    if (!payment) {
      throw new HTTPException(404, { message: "Payment not found" });
    }

    return c.json<SuccessResponse<typeof payment>>(
      {
        success: true,
        data: payment,
        message: "Payment retrieved successfully",
      },
      200
    );
  })
  // Create payment (manual)
  .post("/", withPrisma, zValidator("json", createPaymentSchema), async (c) => {
    const paymentData = c.req.valid("json");
    const { payment_plan: paymentPlan, ...newPaymentData } = structuredClone(paymentData);

    let scheduledPaymentId: null | string = null;

    if (paymentData.type === "INSTALLMENTS" && paymentPlan) {
      const { scheduled_payments, ...paymentPlanData } = paymentPlan;

      const result = await c.get("prisma").$transaction(async (tx) => {
        const plan = await tx.paymentPlan.create({
          data: {
            ...paymentPlanData,
            order_id: newPaymentData.order_id,
          },
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
            payment_plan_id_number: {
              number: 1,
              payment_plan_id: plan.id,
            },
          },
        });

        if (!firstScheduledPayment) {
          throw new HTTPException(404, {
            message: "First scheduled payment not found",
          });
        }

        return firstScheduledPayment;
      });

      scheduledPaymentId = result.id;
    }

    const generatedPayment = await c.get("prisma").payment.create({
      data: {
        ...newPaymentData,
        scheduled_payment_id: scheduledPaymentId,
      },
      include: {
        order: true,
        schedulePayment: true,
      },
    });

    return c.json<SuccessResponse<typeof generatedPayment>>(
      {
        success: true,
        message: "Payment created successfully",
        data: generatedPayment,
      },
      201
    );
  })
  // Update payment (careful - don't affect sales pipeline)
  .put(
    UUID_ROUTE,
    withPrisma,
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

      // Prevent updating payment_status to affect sales pipeline
      // Only allow updating certain fields

      const updatedPayment = await c.get("prisma").payment.update({
        where: { id },
        data: updateData,
        include: {
          order: true,
          schedulePayment: true,
        },
      });

      return c.json<SuccessResponse<typeof updatedPayment>>(
        {
          success: true,
          message: "Payment updated successfully",
          data: updatedPayment,
        },
        200
      );
    }
  )
  // Delete payment (careful - only if not confirmed)
  .delete(
    UUID_ROUTE,
    withPrisma,
    zValidator("param", z.object({ id: z.string().uuid().length(36) })),
    async (c) => {
      const { id } = c.req.param();

      const existingPayment = await c
        .get("prisma")
        .payment.findUnique({ where: { id } });

      if (!existingPayment) {
        throw new HTTPException(404, { message: "Payment not found" });
      }

      // Prevent deletion of confirmed payments
      if (existingPayment.payment_status === "CONFIRMED") {
        throw new HTTPException(400, {
          message:
            "Cannot delete confirmed payments. Create a refund instead.",
        });
      }

      await c.get("prisma").payment.delete({
        where: { id },
      });

      return c.json<SuccessResponse>(
        {
          success: true,
          message: "Payment deleted successfully",
        },
        200
      );
    }
  );
