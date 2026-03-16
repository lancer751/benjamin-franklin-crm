import type { Decimal } from "@prisma/client/runtime/client";
import { emailTransporter } from "@lib/nodemailer";
import nodemailer from "nodemailer";

export async function sendEmail(to: string, subject: string, body: string) {
  const info = await emailTransporter.sendMail({
    from: process.env.SMTP_USER || "ntgxltiwmeozkzp5@ethereal.email",
    to: "pachecolau27@gmail.com",
    subject,
    text: body,
    html: `
    <p>${body}</p>
    <hr/>
    <small>Enviado automáticamente por el sistema</small>
  `,
  });

  console.log("Message sent: ", info.messageId);
  console.log(`Preview: ${nodemailer.getTestMessageUrl(info)}`);
}

export async function sendPaymentConfirmedEmail(
  to: string,
  clientName: string,
  amount: Decimal,
  transactionCode: string,
) {
  await sendEmail(
    to,
    "Pago confirmado — Gracias por tu compra",
    `Hola ${clientName}, tu pago de S/ ${amount.toFixed(2)} ha sido confirmado. Código de transacción: ${transactionCode}.`,
  );
}

export async function sendPaymentRejectedEmail(
  to: string,
  clientName: string,
  amount: Decimal,
) {
  await sendEmail(
    to,
    "Pago rechazado",
    `Hola ${clientName}, tu pago de S/ ${amount.toFixed(2)} fue rechazado. Por favor comunícate con soporte.`,
  );
}

export async function sendEnrollmentSuccessEmail(
  to: string,
  clientName: string,
  courseName: string,
) {
  await sendEmail(
    to,
    `Matrícula exitosa — ${courseName}`,
    `Hola ${clientName}, tu matrícula al curso "${courseName}" fue registrada exitosamente. ¡Bienvenido!`,
  );
}

export async function sendManualPaymentRegisteredEmail(
  to: string,
  clientName: string,
  amount: Decimal,
  method: string,
) {
  await sendEmail(
    to,
    "Pago manual registrado",
    `Hola ${clientName}, se registró un pago manual de S/ ${amount.toFixed(2)} mediante ${method}.`,
  );
}
