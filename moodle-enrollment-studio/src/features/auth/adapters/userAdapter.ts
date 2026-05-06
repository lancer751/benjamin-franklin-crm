import { UserFormValues } from "../schemas/userFormSchema";

export const userAdapter = {
  /**
   * Transforma los datos recibidos del backend al formato que espera el formulario.
   */
  toForm: (user: any, roles: any[]): UserFormValues => {
    if (!user) {
      return {
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        password: "",
        cellphone: "",
        role_id: "",
        is_active: true,
        sales_target: 0,
        assigned_supervisor_id: "",
        team_name: "",
        max_sellers: 0,
        discount_limit_percent: 0,
        can_assign_leads: false,
        can_approve_discounts: false,
        can_reassign_leads: false,
        can_cancel_orders: false,
        can_view_all_team_sales: false,
      };
    }

    const matchedRole = roles.find((r: any) => r.name === user.role?.name);

    return {
      first_name: user.first_name || "",
      middle_name: user.middle_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      password: "", // Nunca mapeamos el password de vuelta
      cellphone: user.cellphone || "",
      role_id: user.role_id || matchedRole?.id || "",
      is_active: user.is_active ?? true,
      
      // Datos de vendedor
      sales_target: user.seller?.sales_target || 0,
      assigned_supervisor_id: user.seller?.assigned_supervisor_id || "",
      
      // Datos de supervisor
      team_name: user.supervisor?.team_name || "",
      max_sellers: user.supervisor?.max_sellers || 0,
      discount_limit_percent: user.supervisor?.discount_limit_percent || 0,
      can_assign_leads: user.supervisor?.can_assign_leads || false,
      can_approve_discounts: user.supervisor?.can_approve_discounts || false,
      can_reassign_leads: user.supervisor?.can_reassign_leads || false,
      can_cancel_orders: user.supervisor?.can_cancel_orders || false,
      can_view_all_team_sales: user.supervisor?.can_view_all_team_sales || false,
    };
  },

  /**
   * Transforma los datos del formulario al Payload que espera el Backend para Crear/Actualizar.
   */
  toPayload: (values: UserFormValues, isSeller: boolean, isSupervisor: boolean, isUpdate: boolean) => {
    const payload: any = {
      first_name: values.first_name,
      middle_name: values.middle_name || "",
      last_name: values.last_name,
      email: values.email,
      password: values.password?.trim() ? values.password : undefined,
      cellphone: values.cellphone?.trim() ? values.cellphone : null,
      role_id: values.role_id,
      is_active: values.is_active,
    };

    if (isSeller) {
      if (!values.assigned_supervisor_id || values.assigned_supervisor_id === "unassigned") {
        throw new Error("VALIDATION_SUPERVISOR");
      }
      payload.seller_profile = {
        sales_target: Number(values.sales_target) || 0,
        assigned_supervisor_id: values.assigned_supervisor_id,
      };
    }

    if (isSupervisor) {
      payload.sales_supervisor_profile = {
        team_name: values.team_name || "Equipo Sin Nombre",
        max_sellers: Number(values.max_sellers) || 0,
        discount_limit_percent: Number(values.discount_limit_percent) || 0,
        can_assign_leads: values.can_assign_leads ?? false,
        can_approve_discounts: values.can_approve_discounts ?? false,
        can_reassign_leads: values.can_reassign_leads ?? false,
        can_cancel_orders: values.can_cancel_orders ?? false,
        can_view_all_team_sales: values.can_view_all_team_sales ?? false,
      };
    }

    if (!isUpdate && !payload.password) {
      throw new Error("VALIDATION_PASSWORD");
    }

    return payload;
  }
};
