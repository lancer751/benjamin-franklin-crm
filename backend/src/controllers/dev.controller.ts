// Dev/simulation controller — development-only endpoints for testing the system.
// These endpoints are NOT for production use.

import type { Request, Response } from "express";
import { processPayment } from "../services/payment.service";
import { getAllEmails, clearAllEmails } from "../services/email.service";

/**
 * POST /dev/simulate-payment
 * Simulates a payment webhook call internally.
 * Body: { orderId, status, amount?, transactionCode? }
 */
export async function simulatePayment(req: Request, res: Response) {
    try {
        const { orderId, status, amount, transactionCode } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({ error: "orderId and status are required" });
        }

        const allowedStatuses = ["confirmado", "rechazado", "pendiente"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: `status must be one of: ${allowedStatuses.join(", ")}` });
        }

        const simulatedCode =
            transactionCode ?? `SIM-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

        const result = await processPayment({
            compraId: orderId,
            amount: Number(amount ?? 0),
            method: "online",
            status,
            transactionCode: simulatedCode,
            isManual: false,
        });

        if (!result.success) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(200).json({
            message: `Simulated payment processed with status: ${status}`,
            simulatedTransactionCode: simulatedCode,
            pagoId: result.pagoId,
            isDuplicate: result.isDuplicate ?? false,
            enrollmentResults: result.enrollmentResults,
        });
    } catch (error) {
        console.error("[DEV] simulatePayment failed:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * GET /dev/emails
 * Returns all simulated emails stored in memory.
 */
export async function getSimulatedEmails(_req: Request, res: Response) {
    const emails = getAllEmails();
    return res.status(200).json({ total: emails.length, emails });
}

/**
 * DELETE /dev/emails
 * Clears the simulated email store.
 */
export async function clearSimulatedEmails(_req: Request, res: Response) {
    clearAllEmails();
    return res.status(200).json({ message: "Email store cleared" });
}
