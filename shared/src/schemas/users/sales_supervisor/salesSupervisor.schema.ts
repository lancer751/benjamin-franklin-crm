import z from "zod";

export const salesSupervisorProfileSchema = z.object({
  id: z.uuid().length(36),
  user_id: z.uuid().length(36),
  max_sellers: z.number().int().default(10),
});

export const createSalesSupervisorProfileSchema =
  salesSupervisorProfileSchema.omit({
    id: true,
  });

export const updateSalesSupervisorProfileSchema = salesSupervisorProfileSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type SalesSupervisorProfile = z.infer<typeof salesSupervisorProfileSchema>;
export type CreateSalesSupervisorProfileDTO = z.infer<
  typeof createSalesSupervisorProfileSchema
>;
export type UpdateSalesSupervisorProfileDTO = z.infer<
  typeof updateSalesSupervisorProfileSchema
>;