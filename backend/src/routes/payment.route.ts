import { Hono } from "hono";
import prisma from "@lib/prisma";
import { processPayment, type PaymentMethod } from "@services/payment.service";
import { Decimal } from "@prisma/client/runtime/client";

export const paymentRoutes = new Hono()
  .get("/", async (c) => {
    try {
      const payments = await prisma.pago.findMany();
      return c.json({ payments }, 200);
    } catch (error) {
      console.error("[PAYMENT] getPayments failed:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .post("/manual", async (c) => {
    try {
      const { order_id, amount, method, paymentStatus } = await c.req.json();
      if (!order_id || !amount || !method || !paymentStatus) {
        return c.json(
          { error: "order_id, amount, method, and status are required" },
          400,
        );
      }

      if (isNaN(Number(amount))) {
        return c.json({ error: "Amount must be a number" }, 400);
      }

      const allowedMethods: PaymentMethod[] = [
        "efectivo",
        "transferencia",
        "yape",
        "pos",
        "online",
      ];

      if (!allowedMethods.includes(method as PaymentMethod)) {
        return c.json(
          {
            error: `Invalid method. Allowed: ${allowedMethods.join(", ")}`,
          },
          400,
        );
      }

      const allowedStatuses = ["confirmado", "rechazado", "pendiente"];
      if (!allowedStatuses.includes(paymentStatus)) {
        return c.json(
          {
            error: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
          },
          400,
        );
      }

      const result = await processPayment({
        compraId: order_id,
        insertedAmount: Decimal(amount),
        method: method as PaymentMethod,
        paymentStatus: paymentStatus as
          | "confirmado"
          | "rechazado"
          | "pendiente",
        isManual: true,
      });

      if (!result.success) {
        return c.json({ error: result.error }, 400);
      }

      return c.json(result, 201);
    } catch (error) {
      console.error("registerManualPayment failed:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .put("/manual/:id", async (c) => {
    const id = c.req.param("id");
    const { paymentStatus } = await c.req.json();

    if (!id || typeof id !== "string") {
      return c.json({ error: "Payment ID is required" }, 400);
    }

    if (!paymentStatus || typeof paymentStatus !== "string") {
      return c.json({ error: "Payment status is required" }, 400);
    }

    const allowedStatuses = ["confirmado", "rechazado", "pendiente"];
    if (!allowedStatuses.includes(paymentStatus)) {
      return c.json(
        {
          error: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
        },
        400,
      );
    }

    try {
      const payment = await prisma.pago.findUnique({ where: { id } });
      if (!payment) {
        return c.json({ error: "Payment not found" }, 404);
      }

      const updatedPayment = await prisma.pago.update({
        where: { id },
        data: {
          estado: paymentStatus as "confirmado" | "rechazado" | "pendiente",
        },
      });

      return c.json(updatedPayment, 200);
    } catch (error) {
      console.error("updatePaymentStatus failed:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");

    if (!id || typeof id !== "string") {
      return c.json({ error: "Payment ID is required" }, 400);
    }

    try {
      const payment = await prisma.pago.findUnique({ where: { id } });
      if (!payment) {
        return c.json({ error: "Payment not found" }, 404);
      }
      return c.json(payment, 200);
    } catch (error) {
      console.error("[PAYMENT] getPaymentById failed:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  });
