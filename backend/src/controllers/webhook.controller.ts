// Webhook controller — handles online payment gateway callbacks (simulated).

import type { Request, Response } from "express";
import {
  processPayment,
  validateWebhookSignature,
} from "../services/payment.service";
import { Decimal } from "@prisma/client/runtime/client";

/**
 * POST /webhooks/payment
 * Body: { orderId, amount, status, transactionCode, signature? }
 */
export async function handlePaymentWebhook(req: Request, res: Response) {
  try {
    const { orderId, amount, status, transactionCode, signature } = req.body;

    if (!orderId || !amount || !status) {
      return res
        .status(400)
        .json({ error: "orderId, amount, and status are required" });
    }

    // Validate signature (simulated)
    const signatureValid = validateWebhookSignature(req.body, signature ?? "");
    if (!signatureValid) {
      return res.status(401).json({ error: "Invalid webhook signature" });
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
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json({
      message: "Payment processed successfully",
      pagoId: result.paymentData?.id,
      status: result.paymentData?.estado,
    });
  } catch (error) {
    console.error("[WEBHOOK] handlePaymentWebhook failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
