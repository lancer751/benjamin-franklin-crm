import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getRoles, createUser, updateUser, getUserById, getSupervisors, updateSupervisorProfile, updateSellerProfile } from "../services/userService";
import { userFormSchema, type UserFormValues } from "../schemas/userFormSchema";
import { userAdapter } from "../adapters/userAdapter";
import { useSaveUserMutation } from "./useSaveUserMutation";

export const useUserFormModal = (isOpen: boolean, onClose: () => void, user?: any | null) => {

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

  // 5. Mutación para Guardar (Refactorizada a Hook)
  const activeUser = fullUserDetails || user; 

  const mutation = useSaveUserMutation(
    activeUser, 
    roles,
    isSeller,
    isSupervisor,
    closeAndReset,
    form.setError
  );

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