import z from "zod";
import { decimalString } from "../utils/fields-validation";

export const DiscountTypeSchema = z.enum(["PERCENTAGE", "FIXED"]);

export const CreateDiscountCodeSchema = z
  .object({
    code: z.string().length(7),
    type: DiscountTypeSchema,
    value: decimalString,
    product_id: z.uuid().length(36).optional(),
    valid_from: z.coerce.date().optional(),
    valid_until: z.coerce.date().optional(),
    max_uses: z.number().int().positive().optional(),
  })
  .refine((d) => d.type !== "PERCENTAGE" || Number(d.value) <= 100, {
    error: "A PERCENTAGE discount value can't exceed 100",
    path: ["value"],
  })
  .refine(
    (d) => !d.valid_from || !d.valid_until || d.valid_from <= d.valid_until,
    {
      error: "You can't enter a valid from date that exceeds valid until date",
    },
  );

export const UpdateDiscountCodeSchema = CreateDiscountCodeSchema.extend({
  is_active: z.boolean(),
}).partial();

export const DiscountCodeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: DiscountTypeSchema.optional(),
  valid_from: z.coerce.date().optional(),
  valid_until: z.coerce.date().optional(),
  is_active: z.boolean().optional(),
  user_id: z.uuid().length(36).optional()
});

export type CreateDiscountCodeInput = z.infer<typeof CreateDiscountCodeSchema>;
export type UpdateDiscountCodeInput = z.infer<typeof UpdateDiscountCodeSchema>;
export type DiscountQueryPagination = z.infer<typeof DiscountCodeQuerySchema>;
