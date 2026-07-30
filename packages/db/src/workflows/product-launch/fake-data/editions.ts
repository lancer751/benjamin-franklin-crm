import { DurationUnit, EditionStatus, Modality, prisma } from "../../..";
import { editionCode } from "../../../helpers";
import type { fakeCourses } from "./courses";
import type { fakeProfessors } from "./professors";

export async function fakeEditions(
  courses: Awaited<ReturnType<typeof fakeCourses>>,
  professors: Awaited<ReturnType<typeof fakeProfessors>>,
) {
  const [lpCourse, pbCourse] = courses;
  const [profTorres, profCamelo, profGomez] = professors;

  const LP_CODE = lpCourse.code; // e.g. "LP-00001"
  const PB_CODE = pbCourse.code;

  const editions = await Promise.all([
    // LP — Edition 1 (VIRTUAL, upcoming)
    prisma.edition.create({
      data: {
        course_id: lpCourse.id,
        edition_number: 1,
        start_date: new Date("2025-06-13"),
        end_date: new Date("2025-08-13"),
        hours_amount: 32,
        classes_number: 16,
        duration_value: 2,
        duration_unit: DurationUnit.MONTHS,
        modality: Modality.VIRTUAL,
        edition_status: EditionStatus.OPEN,
        edition_code: editionCode(LP_CODE, 2025, 1),
        meet_link: "https://meet.google.com/abc-defg-hij",
        whatsapp_group_link: "https://chat.whatsapp.com/example1",
        moodle_course_id: 101,
        // Schedules: Tue & Thu 19:00–21:00
        schedules: {
          create: [
            {
              day_of_week: "MARTES",
              type: "REGULAR",
              slots: { create: [{ start_time: "19:00", end_time: "21:00" }] },
            },
            {
              day_of_week: "JUEVES",
              type: "REGULAR",
              slots: { create: [{ start_time: "19:00", end_time: "21:00" }] },
            },
          ],
        },
        // Assign professors
        assigned_professors: {
          create: [
            { professor_id: profTorres.id },
            { professor_id: profCamelo.id },
          ],
        },
      },
    }),

    // LP — Edition 2 (PRESENCIAL + VIRTUAL hybrid, same course)
    prisma.edition.create({
      data: {
        course_id: lpCourse.id,
        edition_number: 2,
        start_date: new Date("2025-07-05"),
        end_date: new Date("2025-09-05"),
        hours_amount: 32,
        classes_number: 16,
        duration_value: 2,
        duration_unit: DurationUnit.MONTHS,
        modality: Modality.HIBRIDO,
        edition_status: EditionStatus.SCHEDULED,
        edition_code: editionCode(LP_CODE, 2025, 2),
        meet_link: "https://meet.google.com/xyz-uvwx-yz",
        whatsapp_group_link: "https://chat.whatsapp.com/example2",
        moodle_course_id: 102,
        // Schedules: Sat 09:00–13:00
        schedules: {
          create: [
            {
              day_of_week: "SABADO",
              type: "REGULAR",
              slots: { create: [{ start_time: "09:00", end_time: "13:00" }] },
            },
          ],
        },
        assigned_professors: {
          create: [{ professor_id: profTorres.id }],
        },
      },
    }),

    // Power BI — Edition 1 (VIRTUAL)
    prisma.edition.create({
      data: {
        course_id: pbCourse.id,
        edition_number: 1,
        start_date: new Date("2025-06-20"),
        end_date: new Date("2025-08-20"),
        hours_amount: 24,
        classes_number: 12,
        duration_value: 2,
        duration_unit: DurationUnit.MONTHS,
        modality: Modality.VIRTUAL,
        edition_status: EditionStatus.OPEN,
        edition_code: editionCode(PB_CODE, 2025, 1),
        meet_link: "https://meet.google.com/pbi-0001-xxx",
        whatsapp_group_link: "https://chat.whatsapp.com/pbi0001",
        moodle_course_id: 201,
        schedules: {
          create: [
            {
              day_of_week: "LUNES",
              type: "REGULAR",
              slots: { create: [{ start_time: "20:00", end_time: "22:00" }] },
            },
            {
              day_of_week: "MIERCOLES",
              type: "REGULAR",
              slots: { create: [{ start_time: "20:00", end_time: "22:00" }] },
            },
          ],
        },
        assigned_professors: {
          create: [{ professor_id: profGomez.id }],
        },
      },
    }),
  ]);

  return editions;
}
