import type { SuccessResponse } from "@/app";
import prisma from "@/lib/prisma";
import { createPaymentSchema } from "@/zod-schemas/payment.schema";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

export const paymentRoutes = new Hono()
  .get("/", async (c) => {
    const payments = await prisma.payment.findMany({
      orderBy: {
        created_at: "desc",
      },
    });
    return c.json(payments, 200);
  })
  .post("/manual", zValidator("json", createPaymentSchema), async (c) => {
    const paymentData = c.req.valid("json");
    const { scheduled_payments, payment_plan, ...newPaymentData } =
      structuredClone(paymentData);

    const paymentPlan = await prisma.paymentPlan.create({
      data: payment_plan,
    });

    await prisma.scheduledPayment.createMany({
      data: scheduled_payments.map((payment) => ({
        ...payment,
        payment_plan_id: paymentPlan.id,
        status: paymentData.type === "FULL" ? "PAID" : "PENDING",
      })),
    });

    const firstPayment = await prisma.scheduledPayment.findUnique({
      where: {
        payment_plan_id_number: {
          payment_plan_id: paymentPlan.id,
          number: 1,
        },
      },
    })

    if(!firstPayment) {
        throw new HTTPException(404, {message: "scheduled payment not found"})
    }

    const generatedPayment = await prisma.payment.create({
        data: {...newPaymentData, scheduled_payment_id: firstPayment.id}
    })

    return c.json<SuccessResponse<typeof generatedPayment>>({
        message: "New payment created successfully",
        success: true,
        data: generatedPayment
    })
  });
