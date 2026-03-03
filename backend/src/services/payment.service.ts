// Payment processing service
// Handles webhook validation (simulated), payment registration (Pago),
// idempotency (duplicate transaction code check), and Compra status update.

import type { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "../config/connection";
import {
  sendPaymentConfirmedEmail,
  sendPaymentRejectedEmail,
  sendManualPaymentRegisteredEmail,
} from "./email.service";
import type { Pago } from "../../generated/prisma/client";

export type PaymentMethod =
  | "efectivo"
  | "transferencia"
  | "pos"
  | "online"
  | "yape";
export type PaymentStatus = "confirmado" | "rechazado" | "pendiente";

export interface ProcessPaymentOptions {
  compraId: string;
  insertedAmount: Decimal;
  method: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionCode?: string; // required for online/webhook payments
  isManual?: boolean;
}

export interface ProcessPaymentResult {
  success: boolean;
  paymentData?: Pago;
  isDuplicate?: boolean;
  error?: string;
}

/**
 * Simulated webhook signature validation.
 * Returns true if the signature looks valid (always true in simulation).
 */
export function validateWebhookSignature(
  _payload: unknown,
  _signature: string,
): boolean {
  // In production: compare HMAC-SHA256 of payload with secret key.
  // For MVP: always return true (simulated).
  return true;
}

/**
 * Core payment processing function used by both webhook and manual routes.
 */
export async function processPayment(
  options: ProcessPaymentOptions,
): Promise<ProcessPaymentResult> {
  const { compraId, insertedAmount, method, paymentStatus, transactionCode, isManual } =
    options;

  // 1. Validate the order exists
  const compra = await prisma.compra.findUnique({
    where: { id: compraId },
    include: { cliente: true },
  });

  if (!compra) {
    return { success: false, error: `Compra ${compraId} not found` };
  }

  if(insertedAmount < compra.costo_total || insertedAmount > compra.costo_total) {
    return { success: false, error: "Amount is not equal to the total cost of the order" };
  }

  // 4. Create Pago + update Compra in a transaction
  const pago = await prisma.$transaction(async (tx) => {
    const newPago = await tx.pago.create({
      data: {
        orden_id: compraId,
        cantidad: insertedAmount,
        estado: paymentStatus,
        codigo_transaccion: transactionCode ?? null,
        metodo_pago: method,
        fecha_pago: paymentStatus === "confirmado" ? new Date() : null,
      },
    });

    await tx.compra.update({
      where: { id: compraId },
      data: {
        estado_order: "pagado",
      },
    });

    return newPago;
  });

  const clientName = `${compra.cliente.nombre} ${compra.cliente.apellido_paterno}`;
  const clientEmail = compra.cliente.email;

  // 5. Post-payment actions
  if (paymentStatus === "confirmado") {
    // Send payment confirmed email
    sendPaymentConfirmedEmail(
      clientEmail,
      clientName,
      insertedAmount,
      transactionCode ?? pago.id,
    );

    if (isManual) {
      sendManualPaymentRegisteredEmail(clientEmail, clientName, insertedAmount, method);
    }
  }

  if (paymentStatus === "rechazado") {
    sendPaymentRejectedEmail(clientEmail, clientName, insertedAmount);
  }

  return { success: true, paymentData: pago };
}
