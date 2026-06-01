import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useQuery } from "@tanstack/react-query";
import { getRoles, createUser, updateUser, getUserById, getSupervisors, updateSupervisorProfile, updateSellerProfile, getSellerProfileById, getSupervisorById } from "../services/userService";
import { userFormSchema, type UserFormValues } from "../schemas/userFormSchema";
import { userAdapter } from "../adapters/userAdapter";
import { useSaveUserMutation } from "./useSaveUserMutation";

export const useUserFormModal = (isOpen: boolean, onClose: () => void, user?: any | null) => {

  // 🆕 Flag que controla si el form ya fue poblado y está listo para mostrarse
  const [isFormReady, setIsFormReady] = useState(false);

  // Reset del flag cada vez que el modal se abre o cierra
  useEffect(() => {
    if (!isOpen) {
      setIsFormReady(false);
    }
  }, [isOpen]);

  // 1. Fetch de Roles
  const { data: rolesRes, isLoading: loadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
    enabled: isOpen,
  });
  const roles = rolesRes?.success ? rolesRes.data : [];

  // Fetch de Supervisores
  const { data: supervisorsRes, isLoading: loadingSupervisors } = useQuery({
    queryKey: ["supervisors"],
    queryFn: getSupervisors,
    enabled: isOpen,
  });
  const supervisors = supervisorsRes?.success ? supervisorsRes.data : [];

  // ==========================================
  // 4. Fetch Silencioso (On-Demand) para Edición & Consultas Dependientes
  // ==========================================

  // A) Query Base del Usuario
  const { data: fullUserRes, isLoading: isLoadingBase } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: () => getUserById(user!.id),
    enabled: isOpen && !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
  const fullUserDetails = fullUserRes?.success ? fullUserRes.data : null;

  // Determinar el rol de manera reactiva y segura
  const matchedInitialRole = roles && roles.length > 0
    ? roles.find((r: any) => r.id === user?.role_id)
    : null;
  const userRoleName = fullUserDetails?.role?.name || user?.role?.name || matchedInitialRole?.name;

  // IDs de roles desde el catálogo
  const sellerRoleId = roles.find((r: any) => r.name === "SALES_REP")?.id;
  const supervisorRoleId = roles.find((r: any) => r.name === "SALES_SUPERVISOR")?.id;

  // Evaluación del rol en edición
  const isEditingSeller = userRoleName === "SALES_REP" || (!!user?.role_id && user.role_id === sellerRoleId);
  const isEditingSupervisor = userRoleName === "SALES_SUPERVISOR" || (!!user?.role_id && user.role_id === supervisorRoleId);
  const isEditingSpecialRole = !!user && (isEditingSeller || isEditingSupervisor);

  // B) Query Perfil Vendedor
  const { data: sellerProfileRes, isLoading: isLoadingSellerProfile } = useQuery({
    queryKey: ["sellerProfile", user?.id],
    queryFn: () => getSellerProfileById(user.id),
    enabled: isOpen && !!user?.id && isEditingSeller,
    staleTime: 5 * 60 * 1000,
  });
  const sellerProfile = sellerProfileRes?.success ? sellerProfileRes.data : null;

  // C) Query Perfil Supervisor
  const { data: supervisorProfileRes, isLoading: isLoadingSupervisorProfile } = useQuery({
    queryKey: ["supervisorProfile", user?.id],
    queryFn: () => getSupervisorById(user.id),
    enabled: isOpen && !!user?.id && isEditingSupervisor,
    staleTime: 5 * 60 * 1000,
  });
  const supervisorProfile = supervisorProfileRes?.success ? supervisorProfileRes.data : null;

  // Consolidar perfil extendido (Ubicado inmediatamente debajo de los perfiles para resolver TDZ)
  const extendedProfile = isEditingSeller ? sellerProfile : isEditingSupervisor ? supervisorProfile : null;

  // Ahora sí inicializamos useForm ya con 'extendedProfile' y 'roles' plenamente declarados
  const form = useForm<UserFormValues>({
    resolver: standardSchemaResolver(userFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: user
      ? userAdapter.toForm(user, roles, extendedProfile)
      : userAdapter.toForm(null, roles),
  });

  const watchRoleId = form.watch("role_id");
  const selectedRole = roles.find((r: any) => r.id === watchRoleId);
  const isSeller = selectedRole?.name === "SALES_REP";
  const isSupervisor = selectedRole?.name === "SALES_SUPERVISOR";

  // Sincronizar el campo discriminante 'role' cuando cambia el rol seleccionado
  useEffect(() => {
    if (selectedRole?.name) {
      form.setValue("role", selectedRole.name as any);
    }
  }, [selectedRole, form]);

  // 3. Efecto de Sincronización Unificado
  useEffect(() => {
    if (!isOpen || loadingRoles || roles.length === 0) return;

    // MODO CREACIÓN
    if (!user) {
      if (form.getValues("email") !== "") {
        form.reset(userAdapter.toForm(null, []));
      }
      setIsFormReady(true); // 🆕 Listo para creación
      return;
    }

    // MODO EDICIÓN: esperar a que todas las queries resuelvan
    const isWaiting =
      loadingRoles ||
      isLoadingBase ||
      (isEditingSeller && isLoadingSellerProfile) ||
      (isEditingSupervisor && isLoadingSupervisorProfile);

    if (!isWaiting) {
      const baseUser = fullUserDetails || user;
      const resolvedRole = baseUser?.role || matchedInitialRole || roles.find((r: any) => r.id === baseUser?.role_id);
      const safeUser = baseUser ? {
        ...baseUser,
        role: baseUser.role || resolvedRole,
        role_id: baseUser.role_id || resolvedRole?.id,
      } : null;

      form.reset(userAdapter.toForm(safeUser, roles, extendedProfile));
      setIsFormReady(true); // 🆕 Listo SOLO después del reset, garantiza que el Select ya tiene su valor
    }
  }, [
    isOpen,
    loadingRoles,
    user,
    fullUserDetails,
    roles,
    extendedProfile,
    isLoadingBase,
    isLoadingSellerProfile,
    isLoadingSupervisorProfile,
    isEditingSeller,
    isEditingSupervisor,
    matchedInitialRole,
    form,
  ]);

  const closeAndReset = () => {
    form.reset();
    onClose();
  };

  // 5. Mutación para Guardar (Posicionado en la parte inferior con todas sus dependencias declaradas)
  const activeUser = fullUserDetails || user;

  const mutation = useSaveUserMutation(
    activeUser,
    roles,
    isSeller,
    isSupervisor,
    extendedProfile,
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
    isLoadingDetails: !isFormReady, // 🆕 Spinner hasta que el reset ocurrió, no antes
    closeAndReset,
    onSubmit,
  };
};