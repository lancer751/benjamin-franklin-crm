import z from "zod";
import { UUIDField } from "../../../helpers";

const TimeSlotString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in "HH:MM" 24-hour format');

export const EditionScheduleSlotSchema = z.object({
  id: UUIDField,
  schedule_id: UUIDField,
  start_time: TimeSlotString,
  end_time: TimeSlotString,
});

const CreateEditionScheduleSlotSchema = EditionScheduleSlotSchema.omit({
  id: true,
  schedule_id: true,
});

export const CreateRefinedEditionScheduleSlotSchema =
  CreateEditionScheduleSlotSchema.refine(
    ({ start_time, end_time }) => end_time > start_time,
    {
      message: "end_time must be after start_time",
      path: ["end_time"],
    },
  );

export const WeekDaysSchema = z.enum([
  "LUNES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
]);

export const ScheduleTypeSchema = z.enum(["REGULAR", "OVERRIDE"]);

export const EditionScheduleSchema = z.object({
  id: UUIDField,
  edition_id: UUIDField,
  day_of_week: WeekDaysSchema,
  type: ScheduleTypeSchema.default("REGULAR"),
  // Only required for OVERRIDE schedules
  valid_from: z.coerce.date().optional().nullable(),
  valid_until: z.coerce.date().optional().nullable(),
  slots: z
    .array(CreateEditionScheduleSlotSchema)
    .min(1, "Each schedule must have at least one time slot"),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

const CreateEditionScheduleSchema = EditionScheduleSchema.omit({
  id: true,
  edition_id: true,
  created_at: true,
  updated_at: true,
});

export const CreateRefinedEditionScheduleSchema =
  CreateEditionScheduleSchema.refine(
    ({ type, valid_from, valid_until }) => {
      if (type === "OVERRIDE") return !!valid_from && !!valid_until;
      return true;
    },
    {
      message: "OVERRIDE schedules require both valid_from and valid_until",
      path: ["valid_from"],
    },
  ).refine(
    ({ valid_from, valid_until }) => {
      if (valid_from && valid_until) return valid_until > valid_from;
      return true;
    },
    {
      message: "valid_until must be after valid_from",
      path: ["valid_until"],
    },
  );

export const UpdateEditionScheduleSchema =
  CreateEditionScheduleSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided" },
  );
