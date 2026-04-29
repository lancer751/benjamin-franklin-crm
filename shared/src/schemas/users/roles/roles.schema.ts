import z from "zod";

export const RoleAccessEnum = z.enum([
  "SALES_REP",
  "MARKETING",
  "SALES_SUPERVISOR",
  "ADMIN",
  "COLLECTIONS",
]);

export const RoleSchema = z.object({
  id: z.uuid().length(36),
  name: RoleAccessEnum,
  description: z.string().optional().nullable(),
  is_active: z.boolean(),
});

export type RoleAccess = z.infer<typeof RoleAccessEnum>;
export type Role = z.infer<typeof RoleSchema>;