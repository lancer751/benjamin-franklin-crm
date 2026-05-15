import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProfessor, updateProfessor, getProfessorById } from "../services/professorService";
import { professorFormSchema, type ProfessorFormValues } from "../schemas/professorFormSchema";
import { professorAdapter } from "../adapters/professorAdapter";

export const useProfessorFormModal = (isOpen: boolean, onClose: () => void, professor?: any | null) => {
  const queryClient = useQueryClient();

  const form = useForm<ProfessorFormValues>({
    resolver: zodResolver(professorFormSchema),
    mode: "onTouched",
    defaultValues: professorAdapter.toForm(null),
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
      form.reset(professorAdapter.toForm(fullProfessorDetails));
    } else if (!professor) {
      form.reset(professorAdapter.toForm(null));
    } else if (professor && !fullProfessorDetails) {
      form.reset(professorAdapter.toForm(professor));
    }
  }, [fullProfessorDetails, professor, isOpen, form]);

  const closeAndReset = () => {
    form.reset(professorAdapter.toForm(null));
    onClose();
  };

  const mutation = useMutation({
    mutationFn: async (values: ProfessorFormValues) => {
      const payload = professorAdapter.toPayload(values);

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
