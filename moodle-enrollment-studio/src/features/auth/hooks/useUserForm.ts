import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getRoles, createUser, updateUser, getUserById, getSupervisors, updateSupervisorProfile, updateSellerProfile } from "../services/userService";
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
    if (fullUserDetails) {
      form.reset(userAdapter.toForm(fullUserDetails, roles));
    }
  }, [fullUserDetails, roles, form]);

  const closeAndReset = () => {
    form.reset();
    onClose();
  };

  // 5. Mutación para Guardar (Corregida)
  const mutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const roleName = roles.find((r: any) => r.id === values.role_id)?.name || "";
      const userData = userAdapter.toPayload(values, roleName, isSeller, isSupervisor, !!user);

      // 2. Intercepción y Coerción de Datos (Fix Zod)
      if (userData.sales_supervisor_profile) {
        userData.sales_supervisor_profile.discount_limit_percent = String(userData.sales_supervisor_profile.discount_limit_percent || "0");
        if (userData.sales_supervisor_profile.max_manual_discount !== undefined) {
          userData.sales_supervisor_profile.max_manual_discount = String(userData.sales_supervisor_profile.max_manual_discount || "0");
        }
      }

      if (!user) {
        await createUser(userData);
        return "create";
      } else {
        // 3. Enrutamiento Dinámico del PUT (Modo Edición)
        const updatePromises: Promise<any>[] = [];
        
        // Siempre actualizamos la información del usuario base
        updatePromises.push(updateUser(user.id, userData));

        if (isSupervisor) {
          const supervisorId = user.sales_supervisor_profile?.id || user.salesSupervisor?.id;
          if (supervisorId && userData.sales_supervisor_profile) {
            updatePromises.push(updateSupervisorProfile(supervisorId, userData.sales_supervisor_profile));
          }
        } else if (isSeller) {
          const sellerId = user.seller_profile?.id || user.seller?.id;
          if (sellerId && userData.seller_profile) {
            updatePromises.push(updateSellerProfile(sellerId, userData.seller_profile));
          }
        }

        await Promise.all(updatePromises);
        return "update";
      }
    },
    onSuccess: (actionType) => {
      // 4. Limpieza (Invalidación asegurada sin importar la ruta)
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["supervisors"] });
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
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
    isSupervisor,
    isPending: mutation.isPending,
    closeAndReset,
    onSubmit,
  };
};