// Simulated email service — no real emails are sent.
// Emails are logged to the console and stored in memory.

import type { Decimal } from "@prisma/client/runtime/client";

export interface SimulatedEmail {
    id: string;
    to: string;
    subject: string;
    body: string;
    sentAt: string;
    type: "payment_confirmed" | "payment_rejected" | "enrollment_successful" | "manual_payment_registered";
}

// In-memory store
const emailStore: SimulatedEmail[] = [];

function generateId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function sendEmail(
    to: string,
    subject: string,
    body: string,
    type: SimulatedEmail["type"]
): SimulatedEmail {
    const email: SimulatedEmail = {
        id: generateId(),
        to,
        subject,
        body,
        sentAt: new Date().toISOString(),
        type,
    };

    emailStore.push(email);
    console.log(
        `\n📧 [EMAIL SIMULATED]\n  To: ${to}\n  Subject: ${subject}\n  Type: ${type}\n  Body: ${body}\n`
    );
    return email;
}

export function getAllEmails(): SimulatedEmail[] {
    return [...emailStore];
}

export function clearAllEmails(): void {
    emailStore.length = 0;
}

// Convenience helpers for each email type

export function sendPaymentConfirmedEmail(to: string, clientName: string, amount: Decimal, transactionCode: string) {
    return sendEmail(
        to,
        "Pago confirmado — Gracias por tu compra",
        `Hola ${clientName}, tu pago de S/ ${amount.toFixed(2)} ha sido confirmado. Código de transacción: ${transactionCode}.`,
        "payment_confirmed"
    );
}

export function sendPaymentRejectedEmail(to: string, clientName: string, amount: Decimal) {
    return sendEmail(
        to,
        "Pago rechazado",
        `Hola ${clientName}, tu pago de S/ ${amount.toFixed(2)} fue rechazado. Por favor comunícate con soporte.`,
        "payment_rejected"
    );
}

export function sendEnrollmentSuccessEmail(to: string, clientName: string, courseName: string) {
    return sendEmail(
        to,
        `Matrícula exitosa — ${courseName}`,
        `Hola ${clientName}, tu matrícula al curso "${courseName}" fue registrada exitosamente. ¡Bienvenido!`,
        "enrollment_successful"
    );
}

export function sendManualPaymentRegisteredEmail(to: string, clientName: string, amount: Decimal, method: string) {
    return sendEmail(
        to,
        "Pago manual registrado",
        `Hola ${clientName}, se registró un pago manual de S/ ${amount.toFixed(2)} mediante ${method}.`,
        "manual_payment_registered"
    );
}
