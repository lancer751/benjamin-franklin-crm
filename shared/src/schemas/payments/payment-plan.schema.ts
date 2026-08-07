import { z } from "zod";
import { decimalString } from "../../utils/fields-validation";

const ScheduledPaymentInputSchema = z.object({
  due_date: z.coerce.date(),
  due_amount: decimalString,
});

export const CreatePaymentScheduleSchema = z.object({
  start_date: z.coerce.date(),
  installments: z.array(ScheduledPaymentInputSchema).min(1),
});

export type CreatePaymentScheduleInput = z.infer<typeof CreatePaymentScheduleSchema>;