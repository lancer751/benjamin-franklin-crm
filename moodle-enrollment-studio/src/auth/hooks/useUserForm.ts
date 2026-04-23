import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getRoles, createUser, updateUser, createSellerProfile } from "../services/userService";
import { userFormSchema, type UserFormValues } from "../schemas/userFormSchema";

export const useUserFormModal = (isOpen: boolean, onClose: () => void, user?: any | null) => {
  const queryClient = useQueryClient();

  // 1. Fetch de Roles
  const { data: rolesRes, isLoading: loadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
    enabled: isOpen,
  });
  
  const roles = Array.isArray(rolesRes) ? rolesRes : [];

  // 2. Configuración del Formulario
  const form = useForm<UserFormValues>({
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
      max_discount: 0,
    },
  });

  // 3. Efecto de Sincronización (Modo Edición vs Creación)
  useEffect(() => {
    if (!isOpen) return;

    if (user) {
      const matchedRole = roles.find((r: any) => r.name === user.role?.name);
      
      form.reset({
        first_name: user.first_name || "",
        middle_name: user.middle_name || "", 
        last_name: user.last_name || "",
        email: user.email || "",
        password: "", 
        cellphone: user.cellphone || "",
        role_id: user.role_id || matchedRole?.id || "",
        is_active: user.is_active ?? true,
        sales_target: 0,
        max_discount: 0,
      });
    } else {
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
        max_discount: 0,
      });
    }
  }, [user, isOpen, form, roles]);

  // 4. Lógica de UI Condicional (Es vendedor?)
  const watchRoleId = form.watch("role_id");
  const selectedRole = roles.find((r: any) => r.id === watchRoleId);
  const isSeller = selectedRole?.name === "SALES_REP";

  const closeAndReset = () => {
    form.reset();
    onClose();
  };

  // 5. Mutación para Guardar
  const mutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const userData = {
        first_name: values.first_name,
        middle_name: values.middle_name || "", 
        last_name: values.last_name,
        email: values.email,
        password: values.password?.trim() ? values.password : undefined,
        cellphone: values.cellphone?.trim() ? values.cellphone : null,
        role_id: values.role_id,
        is_active: values.is_active,
      };

      if (!user) {
        if (!userData.password) throw new Error("VALIDATION_PASSWORD");
        
        const createdUser = await createUser(userData as any);
        
        if (isSeller && createdUser?.id) {
          await createSellerProfile({
            user_id: createdUser.id,
            sales_target: values.sales_target ?? 0,
            max_discount: values.max_discount ?? 0,
          });
        }
        return "create";
      } else {
        await updateUser(user.id, userData as any);
        return "update";
      }
    },
    onSuccess: (actionType) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      
      if (actionType === "create") {
         if (isSeller) {
             toast.success("Usuario y Perfil de Ventas creados con éxito");
         } else {
             toast.success("Usuario creado con éxito");
         }
      } else {
         toast.success("Usuario actualizado correctamente");
      }
      
      closeAndReset();
    },
    onError: (error: any) => {
      if (error.message === "VALIDATION_PASSWORD") {
          form.setError("password", { type: "manual", message: "La contraseña es obligatoria para nuevos usuarios" });
      } else {
          toast.error("Ocurrió un error al guardar el usuario");
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
    loadingRoles,
    isSeller,
    isPending: mutation.isPending,
    closeAndReset,
    onSubmit,
  };
};