import z from "zod";

const paymentMethod = z.enum(["YAPE", "ONLINE", "POS","CASH", "BANK_TRANSFER"]);
const paymentStatus = z.enum(["CONFIRMED", "REFUNDED", "FAILED"]);
const paymentType = z.enum(["FULL", "INSTALLMENTS"]);
const paymentPlanStatus = z.enum(["COMPLETED", "PENDING", "CANCELLED"]);
const scheduledPaymentStatus = z.enum([
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "PENDING",
]);

const paymentSchema = z.object({
  id: z.uuid().length(36),
  scheduled_payment_id: z.uuid().length(36),
  payment_date: z.date(),
  amount: z.number().positive(),
  payment_method: paymentMethod,
  payment_status: paymentStatus,
  type: paymentType,
  currency: z.string().length(3).optional(),
  transaccion_id: z.string().optional(),
  created_at: z.date().default(new Date()),
  updated_at: z.date().default(new Date()),
});

const paymentPlanSchema = z.object({
  id: z.uuid().length(36),
  total_installments: z.int().positive(),
  order_id: z.uuid().length(36),
  total_amount: z.int().positive(),
  start_date: z.date(),
  status: paymentPlanStatus.default("PENDING"),
});

const scheduledPayment = z.object({
  id: z.uuid().length(36),
  due_date: z.date(),
  due_amount: z.number().positive(),
  payment_plan_id: z.uuid().length(36),
  number: z.number().positive().default(1),
  status: scheduledPaymentStatus,
  created_at: z.date().default(new Date()),
  updated_at: z.date().default(new Date()),
});

export const createPaymentSchema = paymentSchema
  .omit({
    id: true,
    created_at: true,
    updated_at: true,
  })
  .extend({
    payment_plan: paymentPlanSchema.omit({ id: true }),
    scheduled_payments: z.array(
      scheduledPayment.omit({ id: true, created_at: true, updated_at: true, payment_plan_id: true}),
    ),
  });