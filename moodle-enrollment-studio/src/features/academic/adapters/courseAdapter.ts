import { type CourseFormValues, defaultCourseFormValues } from "../schemas/courseFormSchema";

export const courseAdapter = {
  toForm(apiData: any | null): CourseFormValues {
    if (!apiData) {
      return {
        ...defaultCourseFormValues,
        type: "COURSE",
      } as CourseFormValues;
    }

    return {
      code: apiData.code || "",
      name: apiData.name || "",
      type: apiData.type || "COURSE",
      classes_number: apiData.classes_number || ("" as unknown as number),
      description: apiData.description || "",
      image_url: apiData.image_url || "",
    } as CourseFormValues;
  },

  toPayload(formValues: CourseFormValues): any {
    return {
      code: formValues.code.toUpperCase().trim(),
      name: formValues.name.trim(),
      type: formValues.type,
      classes_number: Number(formValues.classes_number),
      description: formValues.description?.trim() || null,
      image_url: formValues.image_url,
    };
  }
};
