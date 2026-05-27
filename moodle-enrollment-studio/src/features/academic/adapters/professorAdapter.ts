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
      };
    }

    return {
      name: apiData.name || "",
      lastname: apiData.lastname || apiData.last_name || "",
      email: apiData.email || "",
      corporate_email: apiData.corporate_email || "",
      cellphone: apiData.cellphone || "",
      moddle_account_id: apiData.moddle_account_id ? Number(apiData.moddle_account_id) : undefined,
    };
  },

  toPayload: (formValues: ProfessorFormValues) => {
    return {
      name: formValues.name,
      lastname: formValues.lastname,
      email: formValues.email,
      corporate_email: formValues.corporate_email || null,
      cellphone: formValues.cellphone || null,
      moddle_account_id: formValues.moddle_account_id ? Number(formValues.moddle_account_id) : null,
    };
  },
};
