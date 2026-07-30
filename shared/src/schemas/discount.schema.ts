import z from "zod";
import { decimalString } from "../utils/fields-validation";

export const DiscountTypeSchema = z.enum(["PERCENTAGE", "FIXED"]);

const DiscountCodeBaseSchema = z.object({
  code: z.string().length(7),
  type: DiscountTypeSchema,
  value: decimalString,
  product_id: z.uuid().length(36).optional(),
  valid_from: z.coerce.date().optional(),
  valid_until: z.coerce.date().optional(),
  max_uses: z.number().int().positive().optional(),
});

type DiscountCodeValidationData = Partial<
  z.infer<typeof DiscountCodeBaseSchema>
>;

function validateDiscountCode(
  data: DiscountCodeValidationData,
  ctx: z.RefinementCtx,
): void {
  if (
    data.type === "PERCENTAGE" &&
    data.value !== undefined &&
    Number(data.value) > 100
  ) {
    ctx.addIssue({
      code: "custom",
      message: "A PERCENTAGE discount value can't exceed 100",
      path: ["value"],
    });
  }

  if (
    data.valid_from !== undefined &&
    data.valid_until !== undefined &&
    data.valid_from > data.valid_until
  ) {
    ctx.addIssue({
      code: "custom",
      message:
        "You can't enter a valid from date that exceeds valid until date",
      path: ["valid_until"],
    });
  }
}

export const CreateDiscountCodeSchema =
  DiscountCodeBaseSchema.superRefine(validateDiscountCode);

export const UpdateDiscountCodeSchema = DiscountCodeBaseSchema.extend({
  is_active: z.boolean(),
})
  .partial()
  .superRefine(validateDiscountCode);

export const DiscountCodeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: DiscountTypeSchema.optional(),
  valid_from: z.coerce.date().optional(),
  valid_until: z.coerce.date().optional(),
  is_active: z.boolean().optional(),
  user_id: z.uuid().length(36).optional(),
});

export type CreateDiscountCodeInput = z.infer<
  typeof CreateDiscountCodeSchema
>;

export type UpdateDiscountCodeInput = z.infer<
  typeof UpdateDiscountCodeSchema
>;

export type DiscountQueryPagination = z.infer<
  typeof DiscountCodeQuerySchema
>;