import { Hono } from "hono";
import {
  processPayment,
  validateWebhookSignature,
} from "@services/payment.service";
import { Decimal } from "@prisma/client/runtime/client";

export const webhookRoutes = new Hono()
  .post("/payment", async (c) => {
    try {
      const body = await c.req.json();
      const { orderId, amount, status, transactionCode, signature } = body;

      if (!orderId || !amount || !status) {
        return c.json(
          { error: "orderId, amount, and status are required" },
          400,
        );
      }

      // Validate signature (simulated)
      const signatureValid = validateWebhookSignature(body, signature ?? "");
      if (!signatureValid) {
        return c.json({ error: "Invalid webhook signature" }, 401);
      }

      const result = await processPayment({
        compraId: orderId,
        insertedAmount: Decimal(amount),
        method: "online",
        paymentStatus: status,
        transactionCode,
        isManual: false,
      });

      if (!result.success) {
        return c.json({ error: result.error }, 400);
      }

      return c.json(
        {
          message: "Payment processed successfully",
          pagoId: result.paymentData?.id,
          status: result.paymentData?.estado,
        },
        200,
      );
    } catch (error) {
      console.error("[WEBHOOK] handlePaymentWebhook failed:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  });
