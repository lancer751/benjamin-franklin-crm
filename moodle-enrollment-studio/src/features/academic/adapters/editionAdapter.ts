import { addMinutes } from "date-fns";
import { type EditionFormValues, defaultEditionFormValues } from "../schemas/editionFormSchema";

const adjustDateTz = (dateStr: string) => {
  const rawDate = new Date(dateStr);
  return addMinutes(rawDate, rawDate.getTimezoneOffset());
};

export const editionAdapter = {
  toForm(
    apiData: any | null,
    actualCourseId?: string | null,
    actualCourseClassesNumber?: number | null
  ): EditionFormValues {
    if (!apiData) {
      return {
        ...defaultEditionFormValues,
        course_id: actualCourseId || "",
        edition_status: "SCHEDULED",
        classes_number: actualCourseClassesNumber || ("" as unknown as number),
      } as EditionFormValues;
    }

    const adjustedStartDate = apiData.start_date ? adjustDateTz(apiData.start_date) : undefined;
    const adjustedEndDate = apiData.end_date ? adjustDateTz(apiData.end_date) : undefined;

    // Map backend's assigned_professors correctly
    const mappedProfessors = apiData.assigned_professors?.map((ap: any) => ({
      professor_id: ap.professor_id || ap.id || ""
    })) || [{ professor_id: "" }];

    // Map backend's schedules correctly
    const mappedSchedules = apiData.schedules?.map((s: any) => ({
      day: s.day_of_week || s.day || "LUNES",
      slots: s.slots?.map((sl: any) => ({
        start_time: sl.start_time || "08:00",
        end_time: sl.end_time || "10:00"
      })) || []
    })) || [];

    return {
      course_id: actualCourseId || apiData.course?.id || apiData.course_id || "",
      edition_number: apiData.edition_number || ("" as unknown as number),
      edition_code: apiData.edition_code || "",
      start_date: adjustedStartDate,
      end_date: adjustedEndDate,
      modality: apiData.modality || "",
      meet_link: apiData.meet_link || "",
      edition_status: apiData.edition_status || "SCHEDULED",
      hours_amount: apiData.hours_amount || ("" as unknown as number),
      classes_number: apiData.classes_number || ("" as unknown as number),
      duration_value: apiData.duration_value || ("" as unknown as number),
      duration_unit: apiData.duration_unit || "WEEKS",
      whatsapp_group_link: apiData.whatsapp_group_link || "",
      moodle_course_id: apiData.moodle_course_id || ("" as unknown as number),
      assigned_professors: mappedProfessors,
      schedules: mappedSchedules,
    } as EditionFormValues;
  },

  toPayload(formValues: EditionFormValues): any {
    return {
      course_id: formValues.course_id,
      edition_code: formValues.edition_code,
      modality: formValues.modality,
      edition_number: Number(formValues.edition_number),
      start_date: formValues.start_date ? formValues.start_date.toISOString() : null,
      end_date: formValues.end_date ? formValues.end_date.toISOString() : null,
      meet_link: formValues.meet_link?.trim() ? formValues.meet_link : null,
      edition_status: formValues.edition_status,
      hours_amount: Number(formValues.hours_amount),
      classes_number: Number(formValues.classes_number),
      duration_value: Number(formValues.duration_value),
      duration_unit: formValues.duration_unit,
      whatsapp_group_link: formValues.whatsapp_group_link?.trim() ? formValues.whatsapp_group_link : null,
      moodle_course_id: formValues.moodle_course_id ? Number(formValues.moodle_course_id) : null,
      assigned_professors: formValues.assigned_professors,
      schedules: formValues.schedules?.map((s) => ({
        day_of_week: s.day.toUpperCase(),
        type: "REGULAR" as const,
        slots: s.slots.map((sl) => ({
          start_time: sl.start_time,
          end_time: sl.end_time,
        })),
      })) || [],
    };
  }
};
