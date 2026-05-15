import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProfessor, updateProfessor, getProfessorById } from "../services/professorService";
import { professorFormSchema, type ProfessorFormValues } from "../schemas/professorFormSchema";

export const useProfessorFormModal = (isOpen: boolean, onClose: () => void, professor?: any | null) => {
  const queryClient = useQueryClient();

  const form = useForm<ProfessorFormValues>({
    resolver: zodResolver(professorFormSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      last_name: "",
      email: "",
      corporate_email: "",
      cellphone: "",
      moddle_account_id: undefined,
    },
  });

  const { data: fullProfessorRes, isLoading: isLoadingProfessor } = useQuery({
    queryKey: ["professor", professor?.id],
    queryFn: () => getProfessorById(professor!.id),
    enabled: isOpen && !!professor?.id,
    staleTime: 5 * 60 * 1000,
  });

  const fullProfessorDetails = fullProfessorRes?.success ? fullProfessorRes.data : null;

  useEffect(() => {
    if (!isOpen) return;

    if (fullProfessorDetails) {
      form.reset({
        name: fullProfessorDetails.name || "",
        last_name: fullProfessorDetails.last_name || "",
        email: fullProfessorDetails.email || "",
        corporate_email: fullProfessorDetails.corporate_email || "",
        cellphone: fullProfessorDetails.cellphone || "",
        moddle_account_id: fullProfessorDetails.moddle_account_id || undefined,
      });
    } else if (!professor) {
      form.reset({
        name: "",
        last_name: "",
        email: "",
        corporate_email: "",
        cellphone: "",
        moddle_account_id: undefined,
      });
    } else if (professor && !fullProfessorDetails) {
      form.reset({
        name: professor.name || "",
        last_name: professor.last_name || "",
        email: professor.email || "",
        corporate_email: professor.corporate_email || "",
        cellphone: professor.cellphone || "",
        moddle_account_id: professor.moddle_account_id || undefined,
      });
    }
  }, [fullProfessorDetails, professor, isOpen, form]);

  const closeAndReset = () => {
    form.reset();
    onClose();
  };

  const mutation = useMutation({
    mutationFn: async (values: ProfessorFormValues) => {
      const payload: any = {
        name: values.name,
        last_name: values.last_name,
        email: values.email,
        corporate_email: values.corporate_email || null,
        cellphone: values.cellphone || null,
        moddle_account_id: values.moddle_account_id || null,
      };

      if (!professor) {
        await createProfessor(payload);
        return "create";
      } else {
        await updateProfessor(professor.id, payload);
        return "update";
      }
    },
    onSuccess: (actionType) => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      if (professor?.id) {
        queryClient.invalidateQueries({ queryKey: ["professor", professor.id] });
      }
      
      if (actionType === "create") {
         toast.success("Docente creado con éxito");
      } else {
         toast.success("Docente actualizado correctamente");
      }
      
      closeAndReset();
    },
    onError: (error: any) => {
      toast.error("Error al guardar el docente");
      console.error(error);
    }
  });

  const onSubmit = (values: ProfessorFormValues) => {
    mutation.mutate(values);
  };

  return {
    form,
    isLoadingProfessor: isOpen && !!professor?.id && isLoadingProfessor,
    isPending: mutation.isPending,
    closeAndReset,
    onSubmit,
  };
};
