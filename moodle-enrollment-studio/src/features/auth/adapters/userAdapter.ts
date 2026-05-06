import { UserFormValues } from "../schemas/userFormSchema";

export const userAdapter = {
  /**
   * Transforma los datos recibidos del backend al formato plano del formulario.
   */
  toForm: (user: any, roles: any[]): UserFormValues => {
    if (!user) {
      return {
        first_name: "", middle_name: "", last_name: "", email: "", password: "",
        cellphone: "", role_id: "", is_active: true,
        sales_target: 0, assigned_supervisor_id: "",
        team_name: "", max_sellers: 0, discount_limit_percent: 0,
        can_assign_leads: false, can_approve_discounts: false,
        can_reassign_leads: false, can_cancel_orders: false, can_view_all_team_sales: false,
      };
    }

    const matchedRole = roles.find((r: any) => r.name === user.role?.name);

    return {
      first_name: user.first_name || "",
      middle_name: user.middle_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      password: "", 
      cellphone: user.cellphone || "",
      role_id: user.role_id || matchedRole?.id || "",
      is_active: user.is_active ?? true,
      
      // ✅ CORRECCIÓN 1: El Adapter se encarga de leer el nombre correcto del backend
      sales_target: user.seller?.sales_target || 0,
      assigned_supervisor_id: user.seller?.assigned_supervisor_id || "",
      
      // Usamos user.salesSupervisor (como viene de Prisma) y lo aplanamos
      team_name: user.salesSupervisor?.team_name || "",
      max_sellers: user.salesSupervisor?.max_sellers || 0,
      discount_limit_percent: user.salesSupervisor?.discount_limit_percent || 0,
      can_assign_leads: user.salesSupervisor?.can_assign_leads || false,
      can_approve_discounts: user.salesSupervisor?.can_approve_discounts || false,
      can_reassign_leads: user.salesSupervisor?.can_reassign_leads || false,
      can_cancel_orders: user.salesSupervisor?.can_cancel_orders || false,
      can_view_all_team_sales: user.salesSupervisor?.can_view_all_team_sales || false,
    };
  },

  /**
   * Transforma los datos del formulario al Payload que espera el Backend.
   */
  // ✅ CORRECCIÓN 2: Recibimos roleName como parámetro
  toPayload: (values: UserFormValues, roleName: string, isSeller: boolean, isSupervisor: boolean, isUpdate: boolean) => {
    const payload: any = {
      first_name: values.first_name,
      middle_name: values.middle_name || "",
      last_name: values.last_name,
      email: values.email,
      password: values.password?.trim() ? values.password : undefined,
      cellphone: values.cellphone?.trim() ? values.cellphone : null,
      role_id: values.role_id,
      role: roleName, // 👈 ¡ESTA ES LA LLAVE MÁGICA PARA ZOD!
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