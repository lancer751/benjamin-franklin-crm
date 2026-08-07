import { z } from "zod";
import { decimalString } from "../utils/fields-validation";


export const PaymentMethodSchema = z.enum([
  "YAPE",
  "ONLINE",
  "POS",
  "CASH",
  "BANK_TRANSFER",
]);
export const PaymentStatusSchema = z.enum(["CONFIRMED", "REFUNDED", "FAILED"]);
export const PaymentTypeSchema = z.enum(["FULL", "INSTALLMENTS"]);
export const PaymentPlanStatusSchema = z.enum([
  "COMPLETED",
  "PENDING",
  "CANCELLED",
]);
export const ScheduledPaymentStatusSchema = z.enum([
  "PAID",
  "OVERDUE",
  "PENDING",
]);

// ----------

const PaymentTargetSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("SCHEDULED_INSTALLMENT"), scheduled_payment_id: z.uuid().length(36) }),
  z.object({ type: z.literal("FULL_CASH"), order_detail_id: z.uuid().length(36) }),
]);

export const CreatePaymentSchema = z.object({
  order_id: z.uuid().length(36),
  payment_date: z.coerce.date(),
  amount: decimalString,
  payment_method: PaymentMethodSchema,
  currency: z.string().length(3).default("PEN"),
  transaccion_id: z.string().optional(),
  payment_receipt: z.string().min(1, "payment_receipt (key del bucket) es requerido"),
  target: PaymentTargetSchema,
});

export const UpdatePaymentStatusSchema = z
  .object({
    payment_status: z.enum(["CONFIRMED", "FAILED", "REFUNDED"]),
    rejection_reason: z.string().min(4).optional(),
  })
  .refine((d) => d.payment_status !== "FAILED" || !!d.rejection_reason, {
    message: "rejection_reason es requerido al marcar un pago como FAILED",
    path: ["rejection_reason"],
  });

export const PaymentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  order_id: z.uuid().optional(),
  payment_status: PaymentStatusSchema.optional(),
});

export const EvidenceUploadRequestSchema = z.object({
  file_name: z.string().min(1),
  content_type: z.enum(["image/jpeg", "image/png", "image/webp", "application/pdf"]),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof UpdatePaymentStatusSchema>;
export type PaymentQuery = z.infer<typeof PaymentQuerySchema>;
export type EvidenceUploadRequestInput = z.infer<typeof EvidenceUploadRequestSchema>;