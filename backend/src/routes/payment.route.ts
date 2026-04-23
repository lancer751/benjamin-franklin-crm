import type { SuccessResponse } from "@/app";
import type { ContextWithPrisma } from "@/lib/contextVariables";
import { createPaymentSchema } from "shared";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

export const paymentRoutes = new Hono<ContextWithPrisma>()
  .get("/", async (c) => {
    const payments = await c.get("prisma").payment.findMany({
      orderBy: {
        created_at: "desc",
      },
    });
    return c.json(payments, 200);
  })
  .post("/manual", zValidator("json", createPaymentSchema), async (c) => {
    const paymentData = c.req.valid("json");
    const {payment_plan, ...newPaymentData} = structuredClone(paymentData)
    let scheduledPaymentId: null | string = null

    if (paymentData.type === "INSTALLMENTS" && payment_plan) {
      const { scheduled_payments, ...paymentPlanData } =
        payment_plan;
      const result = await c.get("prisma").$transaction(async (tx) => {
        const paymentPlan = await tx.paymentPlan.create({
          data: paymentPlanData,
        });

        await tx.scheduledPayment.createMany({
          data: scheduled_payments.map((sch) => {
            return {
              ...sch,
              payment_plan_id: paymentPlan.id,
            };
          }),
        });

        const firstScheduledPayment = await tx.scheduledPayment.findUnique({
          where: {
            payment_plan_id_number: {
              number: 1,
              payment_plan_id: paymentPlan.id,
            },
          },
        });

        if(!firstScheduledPayment){
          throw new HTTPException(404, {message: "First scheduled payment not found"})
        }

        return firstScheduledPayment;
      });

      scheduledPaymentId = result.id
    }

    const generatedPayment = await c.get("prisma").payment.create({
      data: {...newPaymentData, scheduled_payment_id: scheduledPaymentId}
    })

    return c.json<SuccessResponse<typeof generatedPayment>>({
      message: "New payment created successfully",
      success: true,
      data: generatedPayment,
    });
  });
