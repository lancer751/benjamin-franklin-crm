import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UseFormSetError } from "react-hook-form";
import {
  createUser,
  updateUser,
  updateSupervisorProfile,
  updateSellerProfile,
} from "../services/userService";
import { UserFormValues } from "../schemas/userFormSchema";
import { userAdapter } from "../adapters/user.adapter";

export const useSaveUserMutation = (
  user: any | null,
  roles: any[],
  isSeller: boolean,
  isSupervisor: boolean,
  extendedProfile: any | null, // 🆕 Perfil extendido (seller o supervisor)
  closeAndReset: () => void,
  setError: UseFormSetError<UserFormValues>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: UserFormValues) => {
      const roleName = roles.find((r: any) => r.id === values.role_id)?.name || "";
      const userData = userAdapter.toPayload(values, roleName, isSeller, isSupervisor, !!user);

      // Coerción de datos de Supervisor
      if (userData.sales_supervisor_profile) {
        userData.sales_supervisor_profile.discount_limit_percent = String(
          userData.sales_supervisor_profile.discount_limit_percent || "0"
        );
        if (userData.sales_supervisor_profile.max_manual_discount !== undefined) {
          userData.sales_supervisor_profile.max_manual_discount = String(
            userData.sales_supervisor_profile.max_manual_discount || "0"
          );
        }
      }

      // =============================================
      // MODO CREACIÓN
      // =============================================
      if (!user) {
        await createUser(userData);
        return "create";
      }

      // =============================================
      // MODO EDICIÓN
      // =============================================

      // Separamos los campos base de los perfiles extendidos
      const { seller_profile, sales_supervisor_profile, marketing_profile, ...baseUserFields } = userData;

      // 1️⃣ SIEMPRE: Actualizar datos base del usuario (ruta general)
      await updateUser(user.id, baseUserFields);

      // 2️⃣ SI ES VENDEDOR: Actualizar perfil de vendedor en paralelo
      if (isSeller && seller_profile) {
        // 🎯 El ID del perfil viene del extendedProfile (query separada del hook principal)
        const sellerId = extendedProfile?.id;

        if (!sellerId) {
          console.warn("No se encontró el ID del perfil de vendedor para actualizar.");
        } else {
          seller_profile.sales_target = Number(seller_profile.sales_target);
          await updateSellerProfile(sellerId, seller_profile);
        }
      }

      // 3️⃣ SI ES SUPERVISOR: Actualizar perfil de supervisor en paralelo
      if (isSupervisor && sales_supervisor_profile) {
        // 🎯 El ID del perfil viene del extendedProfile (query separada del hook principal)
        const supervisorProfileId = extendedProfile?.id;

        if (!supervisorProfileId) {
          console.warn("No se encontró el ID del perfil de supervisor para actualizar.");
        } else {
          await updateSupervisorProfile(supervisorProfileId, sales_supervisor_profile);
        }
      }

      return "update";
    },

    onSuccess: async (actionType) => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await queryClient.invalidateQueries({ queryKey: ["supervisors"] });
      await queryClient.invalidateQueries({ queryKey: ["sellers"] });
      if (user?.id) {
        await queryClient.invalidateQueries({ queryKey: ["user", user.id] });
        await queryClient.invalidateQueries({ queryKey: ["sellerProfile", user.id] });
        await queryClient.invalidateQueries({ queryKey: ["supervisorProfile", user.id] });
      }

      if (actionType === "create") {
        toast.success(
          isSeller ? "Usuario y Perfil de Ventas creados" : "Usuario creado con éxito"
        );
      } else {
        toast.success("Usuario y perfil actualizados correctamente");
      }

      closeAndReset();
    },

    onError: (error: any) => {
      if (error.message === "VALIDATION_PASSWORD") {
        setError("password", { type: "manual", message: "La contraseña es obligatoria" });
      } else if (error.message === "VALIDATION_SUPERVISOR") {
        setError("seller_profile.assigned_supervisor_id" as any, {
          type: "manual",
          message: "Debe asignar un supervisor obligatoriamente",
        });
      } else {
        toast.error("Error al guardar el usuario");
        console.error(error);
      }
    },
  });
};