import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getRoles, createUser, updateUser, createSellerProfile, updateSellerProfile, getUserById } from "../services/userService";
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
    },
  });

  // 3. Efecto de Sincronización (Modo Edición vs Creación)
useEffect(() => {
  // 🛑 IMPORTANTE: Si no está abierto o los roles aún no cargan, no hagas nada
  if (!isOpen || loadingRoles) return;

  if (user) {
    // Buscamos el rol por nombre si el ID no viene directo
    const matchedRole = roles.find((r: any) => r.name === user.role?.name);
    
    // ✅ Solo reseteamos SI el email en el form es diferente al del usuario (Evita bucle)
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
        sales_target: user.seller?.sales_target || 0, // Traemos datos reales si existen
      });
    }
  } else {
    // Si es nuevo usuario y el form tiene datos, lo limpiamos una sola vez
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
      });
    }
  }
  // Eliminamos 'form' y 'roles' de las dependencias si es posible, 
  // o controlamos el reset con la lógica de arriba.
}, [user, isOpen, loadingRoles]);

  const watchRoleId = form.watch("role_id");
  const selectedRole = roles.find((r: any) => r.id === watchRoleId);
  const isSeller = selectedRole?.name === "SALES_REP";

  // 4. Fetch Silencioso (On-Demand) para Edición
  const isEditingSeller = !!user && user.role?.name === "SALES_REP";
  const { data: fullUserRes } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: () => getUserById(user!.id),
    enabled: isOpen && isEditingSeller,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  const fullUserDetails = fullUserRes?.success ? fullUserRes.data : null;

  useEffect(() => {
    if (fullUserDetails?.seller) {
      form.setValue("sales_target", fullUserDetails.seller.sales_target || 0);
    }
  }, [fullUserDetails, form]);

  const closeAndReset = () => {
    form.reset();
    onClose();
  };

  // 5. Mutación para Guardar (Corregida)
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
        
        // Llamada al servicio
        const res = await createUser(userData as any);
        
        // ACCESO CORREGIDO: Usamos res.data.id
        if (isSeller && res.success && res.data.id) {
          await createSellerProfile({
            user_id: res.data.id,
            sales_target: values.sales_target ?? 0,
          });
        }
        return "create";
      } else {
        await updateUser(user.id, userData as any);
        
        // Actualización Relacional en la Mutación
        if (isSeller) {
          if (fullUserDetails?.seller?.id) {
            await updateSellerProfile(fullUserDetails.seller.id, {
              sales_target: values.sales_target ?? 0,
            });
          } else {
            await createSellerProfile({
              user_id: user.id,
              sales_target: values.sales_target ?? 0,
            });
          }
        }
        
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
    loadingRoles,
    isSeller,
    isPending: mutation.isPending,
    closeAndReset,
    onSubmit,
  };
};