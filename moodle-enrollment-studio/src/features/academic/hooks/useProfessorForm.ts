import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { createProfessor, updateProfessor, getProfessorById, deactivateProfessor, restoreProfessor } from "../services/professorService";
import { professorFormSchema, type ProfessorFormValues } from "../schemas/professorFormSchema";
import { professorAdapter } from "../adapters/professorAdapter";

export const useProfessorForm = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const form = useForm<ProfessorFormValues>({
    resolver: standardSchemaResolver(professorFormSchema) as any,
    mode: "onTouched",
    defaultValues: professorAdapter.toForm(null),
  });

  const { data: fullProfessorRes, isLoading: isLoadingProfessor, isError } = useQuery({
    queryKey: ["professor", id],
    queryFn: () => getProfessorById(id as string),
    enabled: isEditMode,
    staleTime: 5 * 60 * 1000,
  });

  const fullProfessorDetails = fullProfessorRes 
    ? ((fullProfessorRes as any).success ? (fullProfessorRes as any).data : fullProfessorRes)
    : null;

  useEffect(() => {
    if (isEditMode && fullProfessorDetails) {
      form.reset(professorAdapter.toForm(fullProfessorDetails));
    } else if (!isEditMode) {
      form.reset(professorAdapter.toForm(null));
    }
  }, [fullProfessorDetails, isEditMode, form]);

  const mutation = useMutation({
    mutationFn: async (values: ProfessorFormValues) => {
      const payload = professorAdapter.toPayload(values);
      if (!isEditMode) {
        await createProfessor(payload);
        return "create";
      } else {
        await updateProfessor(id!, payload);
        if (fullProfessorDetails && values.is_active !== fullProfessorDetails.is_active) {
          if (values.is_active === true) {
            await restoreProfessor(id!);
          } else {
            await deactivateProfessor(id!);
          }
        }
        return "update";
      }
    },
    onSuccess: (actionType) => {
      queryClient.invalidateQueries({ queryKey: ["professors"] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["professor", id] });
      }
      
      if (actionType === "create") {
         toast.success("Docente creado con éxito");
      } else {
         toast.success("Docente actualizado correctamente");
      }
      
      navigate("/admin/profesores");
    },
    onError: (error: any) => {
      toast.error("Error al guardar el docente");
      console.error(error);
    }
  });

  const onSubmit = (values: ProfessorFormValues) => {
    mutation.mutate(values);
  };

  const handleBack = () => {
    navigate("/admin/profesores");
  };

  return {
    form,
    isEditMode,
    isLoadingProfessor: isEditMode && isLoadingProfessor,
    isError,
    isPending: mutation.isPending,
    onSubmit,
    handleBack,
  };
};
