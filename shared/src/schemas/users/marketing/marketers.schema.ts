import z from "zod";

export const MarketingProfileSchema = z.object({
  id: z.uuid().length(36),
  user_id: z.uuid().length(36),
});

export const CreateMarketingProfileSchema = MarketingProfileSchema.omit({
  id: true,
});

export const UpdateMarketingProfileSchema =
  CreateMarketingProfileSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided" },
  );

export type MarketingProfile = z.infer<typeof MarketingProfileSchema>;
