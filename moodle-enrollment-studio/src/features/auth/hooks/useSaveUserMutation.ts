import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseFormSetError } from "react-hook-form";
import { createUser, updateUser, updateSupervisorProfile, updateSellerProfile } from "../services/userService";
import { UserFormValues } from "../schemas/userFormSchema";
import { userAdapter } from "../adapters/userAdapter";

export const useSaveUserMutation = (
  user: any | null,
  roles: any[],
  isSeller: boolean,
  isSupervisor: boolean,
  closeAndReset: () => void,
  setError: UseFormSetError<UserFormValues>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: UserFormValues) => {
      const roleName = roles.find((r: any) => r.id === values.role_id)?.name || "";
      const userData = userAdapter.toPayload(values, roleName, isSeller, isSupervisor, !!user);

      // 🧠 Intercepción y Coerción de Datos de Supervisor
      if (userData.sales_supervisor_profile) {
        userData.sales_supervisor_profile.discount_limit_percent = String(userData.sales_supervisor_profile.discount_limit_percent || "0");
        if (userData.sales_supervisor_profile.max_manual_discount !== undefined) {
          userData.sales_supervisor_profile.max_manual_discount = String(userData.sales_supervisor_profile.max_manual_discount || "0");
        }
      }

      // 1️⃣ MODO: CREACIÓN (Mantiene tu lógica original perfecta)
      if (!user) {
        await createUser(userData);
        return "create";
      } 
      
      // 2️⃣ MODO: EDICIÓN (Solución al guardado mixto)
      const updatePromises: Promise<any>[] = [];

      // 🎯 A) Siempre agregamos la actualización de los datos comunes del usuario
      // Mapeamos solo las propiedades base (omitimos los objetos de perfil que el backend general no espera)
      const { seller_profile, sales_supervisor_profile, marketing_profile, ...baseUserFields } = userData;
      
      updatePromises.push(updateUser(user.id, baseUserFields));

      // 🎯 B) Si es Supervisor, disparamos en paralelo la actualización de su perfil
      if (isSupervisor) {
        const supervisorId = user.sales_supervisor_profile?.id || user.salesSupervisor?.id;
        if (supervisorId && userData.sales_supervisor_profile) {
          updatePromises.push(
            updateSupervisorProfile(supervisorId, userData.sales_supervisor_profile)
          );
        }
      } 
      
      // 🎯 C) Si es Vendedor (Seller), disparamos en paralelo la actualización de su perfil
      else if (isSeller) {
        const sellerId = user.seller_profile?.id || user.seller?.id;
        if (sellerId && userData.seller_profile) {
          userData.seller_profile.sales_target = Number(userData.seller_profile.sales_target);
          updatePromises.push(
            updateSellerProfile(sellerId, userData.seller_profile)
          );
        }
      }

      // 🚀 EJECUCIÓN SIMULTÁNEA: Lanza ambos endpoints en paralelo (Ahorra tiempo de red)
      await Promise.all(updatePromises);
      return "update";
    },
    onSuccess: async (actionType) => {
      // Invalida las queries para refrescar la tabla al instante
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await queryClient.invalidateQueries({ queryKey: ["supervisors"] });
      await queryClient.invalidateQueries({ queryKey: ["sellers"] });
      if (user?.id) {
        await queryClient.invalidateQueries({ queryKey: ["user", user.id] });
      }
      
      if (actionType === "create") {
         toast.success(isSeller ? "Usuario y Perfil de Ventas creados" : "Usuario creado con éxito");
      } else {
         toast.success("Usuario y perfil actualizados correctamente");
      }
      
      closeAndReset();
    },
    onError: (error: any) => {
      if (error.message === "VALIDATION_PASSWORD") {
          setError("password", { type: "manual", message: "La contraseña es obligatoria" });
      } else if (error.message === "VALIDATION_SUPERVISOR") {
          setError("assigned_supervisor_id", { type: "manual", message: "Debe asignar un supervisor obligatoriamente" });
      } else {
          toast.error("Error al guardar el usuario");
          console.error(error);
      }
    }
  });
};