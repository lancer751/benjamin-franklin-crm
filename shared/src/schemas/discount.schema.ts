import z from "zod";
import { decimalString } from "../utils/fields-validation";

export const DiscountTypeSchema = z.enum(["PERCENTAGE", "FIXED"]);

export const CreateDiscountCodeSchema = z.object({
  code: z.string().length(7),
  type: DiscountTypeSchema,
  value: decimalString,
  product_id: z.uuid().length(36).optional(),
  valid_from: z.coerce.date().optional(),
  valid_until: z.coerce.date().optional(),
  max_uses: z.number().int().positive().optional(),
}).refine(
  (d) => d.type !== "PERCENTAGE" || Number(d.value) <= 100,
  { message: "A PERCENTAGE discount value can't exceed 100", path: ["value"] },
);