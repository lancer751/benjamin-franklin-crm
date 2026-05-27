import { UserFormValues } from "../schemas/userFormSchema";

export const userAdapter = {
  /**
   * Transforma los datos recibidos del backend al formato plano del formulario.
   */
  toForm: (user: any, roles: any[], extendedProfile?: any): UserFormValues => {
    if (!user) {
      return {
        id: "",
        role: "SALES_REP",
        first_name: "", middle_name: "", last_name: "", email: "", password: "",
        cellphone: "", role_id: "", is_active: true,
        seller_profile: {
          sales_target: 0, assigned_supervisor_id: "",
        },
        sales_supervisor_profile: {
          team_name: "", max_sellers: 0, discount_limit_percent: "0",
          can_assign_leads: false, can_approve_discounts: false,
          can_reassign_leads: false, can_cancel_orders: false, can_view_all_team_sales: false,
        }
      } as any;
    }

    const matchedRole = roles.find((r: any) => r.name === user.role?.name);
    const roleName = user.role?.name || matchedRole?.name;

    const seller = roleName === "SALES_REP" ? (extendedProfile || user.seller || user.seller_profile) : null;
    const supervisor = roleName === "SALES_SUPERVISOR" ? (extendedProfile || user.salesSupervisor || user.sales_supervisor_profile) : null;

    return {
      id: user.id || "",
      role: roleName,
      first_name: user.first_name || "",
      middle_name: user.middle_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      password: "", 
      cellphone: user.cellphone || "",
      role_id: user.role_id || matchedRole?.id || "",
      is_active: user.is_active ?? true,
      seller_profile: {
        sales_target: seller?.sales_target || 0,
        assigned_supervisor_id: seller?.assigned_supervisor_id || "",
      },
      
      sales_supervisor_profile: {
        team_name: supervisor?.team_name || "",
        max_sellers: supervisor?.max_sellers || 0,
        discount_limit_percent: String(supervisor?.discount_limit_percent || 0),
        can_assign_leads: supervisor?.can_assign_leads || false,
        can_approve_discounts: supervisor?.can_approve_discounts || false,
        can_reassign_leads: supervisor?.can_reassign_leads || false,
        can_cancel_orders: supervisor?.can_cancel_orders || false,
        can_view_all_team_sales: supervisor?.can_view_all_team_sales || false,
      }
    } as any;
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
      if (!values.seller_profile?.assigned_supervisor_id || values.seller_profile.assigned_supervisor_id === "unassigned") {
        throw new Error("VALIDATION_SUPERVISOR");
      }
      payload.seller_profile = {
        sales_target: Number(values.seller_profile?.sales_target) || 0,
        assigned_supervisor_id: values.seller_profile.assigned_supervisor_id,
      };
    }

    if (isSupervisor) {
      payload.sales_supervisor_profile = {
        team_name: values.sales_supervisor_profile?.team_name || "Equipo Sin Nombre",
        max_sellers: Number(values.sales_supervisor_profile?.max_sellers) || 0,
        discount_limit_percent: Number(values.sales_supervisor_profile?.discount_limit_percent) || 0,
        can_assign_leads: values.sales_supervisor_profile?.can_assign_leads ?? false,
        can_approve_discounts: values.sales_supervisor_profile?.can_approve_discounts ?? false,
        can_reassign_leads: values.sales_supervisor_profile?.can_reassign_leads ?? false,
        can_cancel_orders: values.sales_supervisor_profile?.can_cancel_orders ?? false,
        can_view_all_team_sales: values.sales_supervisor_profile?.can_view_all_team_sales ?? false,
      };
    }

    if (!isUpdate && !payload.password) {
      throw new Error("VALIDATION_PASSWORD");
    }

    return payload;
  }
};