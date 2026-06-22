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
        corporate_email: "", corporate_cellphone: "", birth_date: null,
        seller_profile: {
          sales_target: 0, assigned_supervisor_id: "",
        },
        sales_supervisor_profile: {
          team_name: "", max_sellers: 0, discount_limit_percent: "0",
          can_assign_leads: false, can_approve_discounts: false,
          can_reassign_leads: false, can_cancel_orders: false, can_view_all_team_sales: false,
        },
        marketing_profile: {}
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
      corporate_email: user.corporate_email || "",
      corporate_cellphone: user.corporate_cellphone || "",
      birth_date: user.birth_date ? new Date(user.birth_date) : null,
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
      },
      marketing_profile: user.marketing_profile || {}
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
      corporate_email: values.corporate_email?.trim() ? values.corporate_email : null,
      corporate_cellphone: values.corporate_cellphone?.trim() ? values.corporate_cellphone : null,
      birth_date: values.birth_date ? new Date(values.birth_date).toISOString() : null,
      last_name: values.last_name,
      email: values.email,
      password: values.password?.trim() ? values.password : undefined,
      cellphone: values.cellphone?.trim() ? values.cellphone : null,
      role_id: values.role_id,
      role: roleName, // 👈 ¡ESTA ES LA LLAVE MÁGICA PARA ZOD!
      is_active: values.is_active,
    };

    if (isSeller) {
      const sellerProfile = (values as any).seller_profile;
      if (!sellerProfile?.assigned_supervisor_id || sellerProfile.assigned_supervisor_id === "unassigned") {
        throw new Error("VALIDATION_SUPERVISOR");
      }
      payload.seller_profile = {
        sales_target: Number(sellerProfile?.sales_target) || 0,
        assigned_supervisor_id: sellerProfile.assigned_supervisor_id,
      };
    }

    if (isSupervisor) {
      const supervisorProfile = (values as any).sales_supervisor_profile;
      payload.sales_supervisor_profile = {
        team_name: supervisorProfile?.team_name || "Equipo Sin Nombre",
        max_sellers: Number(supervisorProfile?.max_sellers) || 0,
        discount_limit_percent: Number(supervisorProfile?.discount_limit_percent) || 0,
        can_assign_leads: supervisorProfile?.can_assign_leads ?? false,
        can_approve_discounts: supervisorProfile?.can_approve_discounts ?? false,
        can_reassign_leads: supervisorProfile?.can_reassign_leads ?? false,
        can_cancel_orders: supervisorProfile?.can_cancel_orders ?? false,
        can_view_all_team_sales: supervisorProfile?.can_view_all_team_sales ?? false,
      };
    }

    if (roleName === "MARKETING") {
      payload.marketing_profile = (values as any).marketing_profile || {};
    }

    if (!isUpdate && !payload.password) {
      throw new Error("VALIDATION_PASSWORD");
    }

    return payload;
  }
};