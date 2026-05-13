import z from "zod";

export const MoodleAccountStatusEnum = z.enum(["ACTIVE", "SUSPENDED"]);

export const BaseProfessorSchema = z.object({
  id: z.uuid().length(36),
  name: z.string().min(1, "Name is required").max(255),
  lastname: z.string().min(1, "Lastname is required").max(255),
  email: z.email("Invalid email"),
  corporate_email: z.email("Invalid corporate email"),
  cellphone: z.string().length(9),
  moddle_account_id: z.number().int().positive(),
  moodle_user_status: MoodleAccountStatusEnum.default("ACTIVE"),
  created_at: z.coerce.date,
  updated_at: z.coerce.date,
});

export const BaseCreateProfessorSchema = BaseProfessorSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const AssignProfessorsOnEditionSchema = BaseProfessorSchema.omit({
  created_at: true,
  updated_at: true,
})

export const UpdateProfessorSchema = BaseCreateProfessorSchema.partial();

export type Professor = z.infer<typeof BaseProfessorSchema>;
export type CreateProfessorDTO = z.infer<typeof BaseCreateProfessorSchema>;
export type UpdateProfessorDTO = z.infer<typeof UpdateProfessorSchema>;
