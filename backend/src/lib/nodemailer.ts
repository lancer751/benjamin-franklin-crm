import nodemailer from "nodemailer";

export const emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: true,
    auth: {
        user: process.env.SMTP_USER || "ntgxltiwmeozkzp5@ethereal.email",
        pass: process.env.SMTP_PASS || "ayd5NtbEM1gBn3D78p",
    },
    tls: { rejectUnauthorized: false },
});