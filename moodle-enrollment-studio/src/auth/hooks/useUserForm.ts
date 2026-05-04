import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getRoles, createUser, updateUser, getUserById, getSupervisors } from "../services/userService";
import { userFormSchema, type UserFormValues } from "../schemas/userFormSchema";

export const useUserFormModal = (isOpen: boolean, onClose: () => void, user?: any | null) => {
  const queryClient = useQueryClient();

  // 1. Fetch de Roles
  const { data: rolesRes, isLoading: loadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
    enabled: isOpen,
  });
  
  // Ajuste: Extraer data de la respuesta de Hono
  const roles = rolesRes?.success ? rolesRes.data : [];

  // Fetch de Supervisores
  const { data: supervisorsRes, isLoading: loadingSupervisors } = useQuery({
    queryKey: ["supervisors"],
    queryFn: getSupervisors,
    enabled: isOpen,
  });
  const supervisors = supervisorsRes?.success ? supervisorsRes.data : [];

  // 2. Configuración del Formulario
  const form = useForm<UserFormValues>({
    // @ts-ignore - A veces Zod y Hook Form pelean por versiones, esto ignora el error 2345 si persiste
    resolver: zodResolver(userFormSchema),
    mode: "onTouched",
    defaultValues: {
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
    },
  });

  // 3. Efecto de Sincronización (Modo Edición vs Creación)
useEffect(() => {
  if (!isOpen || loadingRoles) return;

  if (user) {
    const matchedRole = roles.find((r: any) => r.name === user.role?.name);
    if (form.getValues("email") !== user.email) {
      form.reset({
        first_name: user.first_name || "",
        middle_name: user.middle_name || "", 
        last_name: user.last_name || "",
        email: user.email || "",
        password: "", 
        cellphone: user.cellphone || "",
        role_id: user.role_id || matchedRole?.id || "",
        is_active: user.is_active ?? true,
        sales_target: user.seller?.sales_target || 0,
        assigned_supervisor_id: user.seller?.assigned_supervisor_id || "",
        team_name: user.supervisor?.team_name || "",
        max_sellers: user.supervisor?.max_sellers || 0,
        discount_limit_percent: user.supervisor?.discount_limit_percent || 0,
        can_assign_leads: user.supervisor?.can_assign_leads || false,
        can_approve_discounts: user.supervisor?.can_approve_discounts || false,
        can_reassign_leads: user.supervisor?.can_reassign_leads || false,
        can_cancel_orders: user.supervisor?.can_cancel_orders || false,
        can_view_all_team_sales: user.supervisor?.can_view_all_team_sales || false,
      });
    }
  } else {
    if (form.getValues("email") !== "") {
      form.reset({
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
      });
    }
  }
}, [user, isOpen, loadingRoles, roles, form]);

  const watchRoleId = form.watch("role_id");
  const selectedRole = roles.find((r: any) => r.id === watchRoleId);
  const isSeller = selectedRole?.name === "SALES_REP";
  const isSupervisor = selectedRole?.name === "SALES_SUPERVISOR";

  // 4. Fetch Silencioso (On-Demand) para Edición
  const isEditingSpecialRole = !!user && (user.role?.name === "SALES_REP" || user.role?.name === "SALES_SUPERVISOR");
  const { data: fullUserRes } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: () => getUserById(user!.id),
    enabled: isOpen && isEditingSpecialRole,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  const fullUserDetails = fullUserRes?.success ? fullUserRes.data : null;

  useEffect(() => {
    if (fullUserDetails?.seller) {
      form.setValue("sales_target", fullUserDetails.seller.sales_target || 0);
      form.setValue("assigned_supervisor_id", fullUserDetails.seller.assigned_supervisor_id || "");
    }
    if (fullUserDetails?.supervisor) {
      form.setValue("team_name", fullUserDetails.supervisor.team_name || "");
      form.setValue("max_sellers", fullUserDetails.supervisor.max_sellers || 0);
      form.setValue("discount_limit_percent", fullUserDetails.supervisor.discount_limit_percent || 0);
      form.setValue("can_assign_leads", fullUserDetails.supervisor.can_assign_leads || false);
      form.setValue("can_approve_discounts", fullUserDetails.supervisor.can_approve_discounts || false);
      form.setValue("can_reassign_leads", fullUserDetails.supervisor.can_reassign_leads || false);
      form.setValue("can_cancel_orders", fullUserDetails.supervisor.can_cancel_orders || false);
      form.setValue("can_view_all_team_sales", fullUserDetails.supervisor.can_view_all_team_sales || false);
    }
  }, [fullUserDetails, form]);

  const closeAndReset = () => {
    form.reset();
    onClose();
  };

  // 5. Mutación para Guardar (Corregida)
  const mutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const userData: any = {
        first_name: values.first_name,
        middle_name: values.middle_name || "", 
        last_name: values.last_name,
        email: values.email,
        password: values.password?.trim() ? values.password : undefined,
        cellphone: values.cellphone?.trim() ? values.cellphone : null,
        role_id: values.role_id,
        is_active: values.is_active,
      };

      // Si es vendedor, incluimos el perfil en la misma petición
      if (isSeller) {
        if (!values.assigned_supervisor_id || values.assigned_supervisor_id === "unassigned") {
          throw new Error("VALIDATION_SUPERVISOR");
        }
        userData.seller_profile = {
          sales_target: Number(values.sales_target) || 0,
          assigned_supervisor_id: values.assigned_supervisor_id,
        };
      }

      // Si es supervisor, incluimos el perfil correspondiente
      if (isSupervisor) {
        userData.sales_supervisor_profile = {
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

      if (!user) {
        if (!userData.password) throw new Error("VALIDATION_PASSWORD");
        await createUser(userData);
        return "create";
      } else {
        await updateUser(user.id, userData);
        return "update";
      }
    },
    onSuccess: (actionType) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ["user", user.id] });
      }
      
      if (actionType === "create") {
         toast.success(isSeller ? "Usuario y Perfil de Ventas creados" : "Usuario creado con éxito");
      } else {
         toast.success("Usuario actualizado correctamente");
      }
      
      closeAndReset();
    },
    onError: (error: any) => {
      if (error.message === "VALIDATION_PASSWORD") {
          form.setError("password", { type: "manual", message: "La contraseña es obligatoria" });
      } else if (error.message === "VALIDATION_SUPERVISOR") {
          form.setError("assigned_supervisor_id", { type: "manual", message: "Debe asignar un supervisor obligatoriamente" });
      } else {
          toast.error("Error al guardar el usuario");
          console.error(error);
      }
    }
  });

  const onSubmit = (values: UserFormValues) => {
    mutation.mutate(values);
  };

  return {
    form,
    roles,
    supervisors,
    loadingRoles,
    loadingSupervisors,
    isSeller,
    isPending: mutation.isPending,
    closeAndReset,
    onSubmit,
  };
};