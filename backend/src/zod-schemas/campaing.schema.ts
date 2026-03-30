import { z } from "zod";

export const campaingSchema = z.object({
  id: z.uuid().length(36),
  campaing_name: z.string().max(255),
  initial_budget: z
    .number()
    .positive()
    .max(99999999.99)
    .refine((val) => Number.isInteger(val * 100), {
      message: "Must have at most 2 decimal places",
    }),
  total_spent: z
    .number()
    .positive()
    .max(99999999.99)
    .optional()
    .refine(
      (val) => {
        if (val !== undefined) return Number.isInteger(val * 100);
      },
      {
        message: "Must have at most 2 decimal places",
      },
    ),
  status: z.enum(["ACTIVE", "INACTIVE", "PAUSED"]),
  start_date: z.date(),
  end_date: z.date().optional(),
  platform: z.enum(["FACEBOOK", "INSTAGRAM", "TIKTOK", "WEBSITE"]),
  is_organic: z.boolean(),
  created_at: z.date(),
  updated_at: z.date(),
});

export const createCampaingSchema = campaingSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const updateCampaingSchema = createCampaingSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });
