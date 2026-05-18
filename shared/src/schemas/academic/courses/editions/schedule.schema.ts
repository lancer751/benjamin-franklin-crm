import z from "zod";
import { UUIDField } from "../../../helpers";

const TimeSlotString = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Time must be in "HH:MM" 24-hour format');

// --- SLOT BASE ---
const EditionScheduleSlotBase = z.object({
  id: UUIDField,
  schedule_id: UUIDField,
  start_time: TimeSlotString,
  end_time: TimeSlotString,
});

export const EditionScheduleSlotSchema = EditionScheduleSlotBase.refine(
  ({ start_time, end_time }) => end_time > start_time, 
  {
    message: "end_time must be after start_time",
    path: ["end_time"],
  }
);

export const CreateEditionScheduleSlotSchema = EditionScheduleSlotBase.omit({
  id: true,
  schedule_id: true,
}).refine(
  ({ start_time, end_time }) => end_time > start_time, 
  {
    message: "end_time must be after start_time",
    path: ["end_time"],
  }
);

export const WeekDaysSchema = z.enum([
  "LUES",
  "MARTES",
  "MIERCOLES",
  "JUEVES",
  "VIERNES",
  "SABADO",
  "DOMINGO",
]);

export const ScheduleTypeSchema = z.enum(["REGULAR", "OVERRIDE"]);

// --- SCHEDULE BASE ---
const EditionScheduleBase = z.object({
  id: UUIDField,
  edition_id: UUIDField,
  day_of_week: WeekDaysSchema,
  type: ScheduleTypeSchema.default("REGULAR"),
  valid_from: z.coerce.date().optional().nullable(),
  valid_until: z.coerce.date().optional().nullable(),
  slots: z
    .array(CreateEditionScheduleSlotSchema)
    .min(1, "Each schedule must have at least one time slot"),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export const EditionScheduleSchema = EditionScheduleBase.refine(
  ({ type, valid_from, valid_until }) => {
    if (type === "OVERRIDE") return !!valid_from && !!valid_until;
    return true;
  },
  {
    message: "OVERRIDE schedules require both valid_from and valid_until",
    path: ["valid_from"],
  }
).refine(
  ({ valid_from, valid_until }) => {
    if (valid_from && valid_until) return valid_until > valid_from;
    return true;
  },
  {
    message: "valid_until must be after valid_from",
    path: ["valid_until"],
  }
);

export const CreateEditionScheduleSchema = EditionScheduleBase.omit({
  id: true,
  edition_id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateEditionScheduleSchema = CreateEditionScheduleSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" }
);