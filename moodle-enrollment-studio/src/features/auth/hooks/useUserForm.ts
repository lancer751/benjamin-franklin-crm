import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getRoles, createUser, updateUser, getUserById, getSupervisors } from "../services/userService";
import { userFormSchema, type UserFormValues } from "../schemas/userFormSchema";
import { userAdapter } from "../adapters/userAdapter";

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
    defaultValues: userAdapter.toForm(null, []),
  });

  // 3. Efecto de Sincronización (Modo Edición vs Creación)
useEffect(() => {
  if (!isOpen || loadingRoles) return;

  if (user) {
    if (form.getValues("email") !== user.email) {
      form.reset(userAdapter.toForm(user, roles));
    }
  } else {
    if (form.getValues("email") !== "") {
      form.reset(userAdapter.toForm(null, []));
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
      const userData = userAdapter.toPayload(values, isSeller, isSupervisor, !!user);

      if (!user) {
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