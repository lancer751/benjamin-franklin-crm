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

const paymentSchema = z.object({
  id: z.uuid().length(36),
  order_id: z.uuid().length(36),
  scheduled_payment_id: z.uuid().length(36).optional().nullable(),
  payment_date: z.coerce.date(),
  amount: decimalString,
  payment_method: PaymentMethodSchema,
  payment_status: PaymentStatusSchema,
  type: PaymentTypeSchema,
  currency: z.string().length(3).default("PEN"),
  transaccion_id: z.string().optional().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

const paymentPlanSchema = z.object({
  id: z.uuid().length(36),
  total_installments: z.number().int().positive(),
  order_id: z.uuid().length(36),
  total_amount: decimalString,
  start_date: z.coerce.date(),
  status: PaymentPlanStatusSchema.default("PENDING"),
});

const scheduledPaymentSchema = z.object({
  id: z.uuid().length(36),
  due_date: z.coerce.date(),
  due_amount: decimalString,
  payment_plan_id: z.uuid().length(36),
  number: z.number().int().positive(),
  status: ScheduledPaymentStatusSchema.default("PENDING"),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

// ── Create ───────────────────────────────────────────────────────────────
// payment_status stays client-settable at creation time (a payment record
// represents an already-resolved outcome — confirmed cash-in-hand, or a
// failed/refunded attempt — not a pending intent). What's no longer allowed
// is silently flipping that status later; see UpdatePaymentStatusSchema.

export const createPaymentSchema = paymentSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
    scheduled_payment_id: true,
  })
  .extend({
    payment_plan: paymentPlanSchema
      .omit({ id: true, status: true })
      .extend({
        scheduled_payments: z
          .array(
            scheduledPaymentSchema.omit({
              id: true,
              created_at: true,
              updated_at: true,
              payment_plan_id: true,
              status: true,
            }),
          )
          .min(1, "At least one scheduled payment is required"),
      })
      .optional(),
  })
  .refine((data) => (data.type === "INSTALLMENTS" ? !!data.payment_plan : true), {
    message: "payment_plan is required when type is INSTALLMENTS",
    path: ["payment_plan"],
  });

// ── Update ───────────────────────────────────────────────────────────────
// Deliberately NOT a partial() of createPaymentSchema — that would silently
// let callers change payment_status, order_id, and amount, which is exactly
// what we don't want on a generic PUT. Only cosmetic/reference fields here.

export const UpdatePaymentSchema = paymentSchema
  .pick({ payment_date: true, transaccion_id: true, currency: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

// Status transitions go through their own endpoint/schema so they can carry
// their own authorization and business rules (e.g. only ADMIN/SUPERVISOR,
// can't un-refund, can't confirm an already-failed payment, etc.)
export const UpdatePaymentStatusSchema = z.object({
  payment_status: PaymentStatusSchema,
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof UpdatePaymentSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof UpdatePaymentStatusSchema>;