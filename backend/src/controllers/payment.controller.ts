// Payment controller — manual payment registration and admin-initiated workflows.
import type { Request, Response } from "express";
import {
  processPayment,
  type PaymentMethod,
} from "../services/payment.service";
import { prisma } from "../config/connection";
import { Decimal } from "@prisma/client/runtime/client";

interface RegisterManualPaymentRequestBody {
  order_id: string;
  amount: number;
  method: PaymentMethod;
  paymentStatus: "confirmado" | "rechazado" | "pendiente";
}

export async function getPayments(req: Request, res: Response) {
  try {
    const payments = await prisma.pago.findMany();
    return res.status(200).json({ payments });
  } catch (error) {
    console.error("[PAYMENT] getPayments failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getPaymentById(req: Request, res: Response) {
  const { id } = req.params;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Payment ID is required" });
  }
  try {
    const payment = await prisma.pago.findUnique({ where: { id } });
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    return res.status(200).json(payment);
  } catch (error) {
    console.error("[PAYMENT] getPaymentById failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function registerManualPayment(
  req: Request<
    Record<string, never>,
    Record<string, never>,
    RegisterManualPaymentRequestBody
  >,
  res: Response,
) {
  try {
    const { order_id, amount, method, paymentStatus } = req.body;

    if (!order_id || !amount || !method || !paymentStatus) {
      return res
        .status(400)
        .json({ error: "order_id, amount, method, and status are required" });
    }

    if (isNaN(Number(amount))) {
      return res.status(400).json({ error: "Amount must be a number" });
    }
    console.log(amount, typeof amount);
    const allowedMethods: PaymentMethod[] = [
      "efectivo",
      "transferencia",
      "yape",
      "pos",
      "online",
    ];

    if (!allowedMethods.includes(method as PaymentMethod)) {
      return res.status(400).json({
        error: `Invalid method. Allowed: ${allowedMethods.join(", ")}`,
      });
    }

    const allowedStatuses = ["confirmado", "rechazado", "pendiente"];
    if (!allowedStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        error: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
      });
    }

    const result = await processPayment({
      compraId: order_id,
      insertedAmount: Decimal(amount),
      method: method as PaymentMethod,
      paymentStatus: paymentStatus as "confirmado" | "rechazado" | "pendiente",
      isManual: true,
    });

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("registerManualPayment failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updatePaymentStatus(req: Request, res: Response){
  const {id} = req.params
  const { paymentStatus } = req.body

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Payment ID is required" });
  }

  if (!paymentStatus || typeof paymentStatus !== "string") {
    return res.status(400).json({ error: "Payment status is required" });
  }

  const allowedStatuses = ["confirmado", "rechazado", "pendiente"];
  if (!allowedStatuses.includes(paymentStatus)) {
    return res.status(400).json({
      error: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
    });
  }

  try {
      const payment = await prisma.pago.findUnique({ where: { id } });
      if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
      }

      const updatedPayment = await prisma.pago.update({
        where: {id},
        data: { estado: paymentStatus as "confirmado" | "rechazado" | "pendiente" },
      })

      return res.status(200).json(updatedPayment);
  } catch (error) {
    console.error("updatePaymentStatus failed:", error);
    return res.status(500).json({ error: "Internal server error" });    
  }
}