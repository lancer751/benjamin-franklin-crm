import { ProfessorFormValues } from "../schemas/professorFormSchema";

export const professorAdapter = {
  toForm: (apiData: any | null): ProfessorFormValues => {
    if (!apiData) {
      return {
        name: "",
        lastname: "",
        email: "",
        corporate_email: "",
        cellphone: "",
        moddle_account_id: undefined,
        moodle_user_status: "ACTIVE",
        is_active: true,
        profession: "",
        linkedin_account_url: "",
        curriculum_vitae: "",
      };
    }

    return {
      name: apiData.name || "",
      lastname: apiData.lastname || apiData.last_name || "",
      email: apiData.email || "",
      corporate_email: apiData.corporate_email || "",
      cellphone: apiData.cellphone || "",
      moddle_account_id: apiData.moddle_account_id ? Number(apiData.moddle_account_id) : undefined,
      moodle_user_status: apiData.moodle_user_status || "ACTIVE",
      is_active: apiData.is_active !== undefined ? Boolean(apiData.is_active) : true,
      profession: apiData.profession || "",
      linkedin_account_url: apiData.linkedin_account_url || "",
      curriculum_vitae: apiData.curriculum_vitae || "",
    };
  },

  toPayload: (formValues: ProfessorFormValues) => {
    return {
      name: formValues.name,
      lastname: formValues.lastname,
      email: formValues.email,
      corporate_email: formValues.corporate_email || undefined,
      cellphone: formValues.cellphone,
      moddle_account_id: formValues.moddle_account_id ? Number(formValues.moddle_account_id) : undefined,
      moodle_user_status: formValues.moodle_user_status || "ACTIVE",
      is_active: formValues.is_active,
      profession: formValues.profession || undefined,
      linkedin_account_url: formValues.linkedin_account_url || undefined,
      curriculum_vitae: formValues.curriculum_vitae || undefined,
    };
  },
};