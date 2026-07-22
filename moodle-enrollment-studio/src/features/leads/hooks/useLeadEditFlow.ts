import { useEffect, useMemo, useState } from "react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { buildUpdateLeadPayload, hasLeadChanges, mapLeadToFormValues, unwrapLeadForEdit } from "../adapters/leadQuickFormAdapter";
import { getLeadById, updateLead } from "../services/leadService";
import { defaultLeadFieldValues, leadFieldsSchema, type LeadFieldsData, type LeadFieldsInput } from "../schemas/leadFieldsSchema";

const responseError = (response: unknown, fallback: string) => {
  if (!response || typeof response !== "object") return fallback;
  const body = response as { success?: boolean; message?: string; error?: string };
  return body.message || body.error || fallback;
};

export function useLeadEditFlow(id: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [initialData, setInitialData] = useState<LeadFieldsData | null>(null);

  const form = useForm<LeadFieldsInput, unknown, LeadFieldsData>({
    resolver: standardSchemaResolver(leadFieldsSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: defaultLeadFieldValues,
  });

  const leadQuery = useQuery({
    queryKey: ["lead", id],
    queryFn: async () => {
      const response = await getLeadById(id);
      const lead = unwrapLeadForEdit(response);
      if (!lead) throw new Error(responseError(response, "El prospecto solicitado no existe."));
      return lead;
    },
    enabled: Boolean(id),
    retry: false,
  });

  useEffect(() => {
    if (!leadQuery.data) return;
    const mapped = mapLeadToFormValues(leadQuery.data);
    const parsed = leadFieldsSchema.safeParse(mapped);
    if (!parsed.success) return;
    setInitialData(parsed.data);
    form.reset(mapped);
  }, [form, leadQuery.data]);

  const values = form.watch();
  const parsedValues = useMemo(() => leadFieldsSchema.safeParse(values), [values]);
  const hasChanges = Boolean(initialData && parsedValues.success && hasLeadChanges(initialData, parsedValues.data));

  useEffect(() => {
    if (!hasChanges) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [hasChanges]);

  const mutation = useMutation({
    mutationFn: async (data: LeadFieldsData) => {
      if (!initialData) throw new Error("No fue posible preparar los datos originales del prospecto.");
      const payload = buildUpdateLeadPayload(initialData, data);
      if (Object.keys(payload).length === 0) return { unchanged: true };
      const response = await updateLead(id, payload);
      const body = response as unknown as { success?: boolean; message?: string; error?: string };
      if (body.success !== true) throw new Error(responseError(response, "No fue posible actualizar el prospecto."));
      return { unchanged: false };
    },
    onSuccess: async ({ unchanged }) => {
      if (unchanged) return;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["lead", id] }),
        queryClient.invalidateQueries({ queryKey: ["leads"] }),
      ]);
      toast.success("Prospecto actualizado correctamente.");
      navigate(`/prospectos/${id}`);
    },
  });

  const cancel = () => {
    if (hasChanges && !window.confirm("Tienes cambios sin guardar. ¿Deseas salir de todas formas?")) return;
    navigate(`/prospectos/${id}`);
  };

  const queryMessage = leadQuery.error instanceof Error ? leadQuery.error.message : "No fue posible cargar este prospecto.";
  const mutationMessage = mutation.error instanceof Error ? mutation.error.message : "";
  const isNotFound = /no existe|not found|no encontrado/i.test(queryMessage);
  const hasAdditionalData = Boolean(initialData && (
    initialData.middle_name || initialData.dni || initialData.profession || initialData.secondary_email
    || initialData.address || initialData.additionalPhones.length || initialData.gender !== "NOT_SPECIFIED"
    || initialData.lead_status !== "ACTIVE"
  ));

  return {
    form,
    isLoading: leadQuery.isLoading,
    isError: leadQuery.isError || (leadQuery.isSuccess && !initialData),
    isNotFound,
    queryMessage,
    mutationMessage,
    isPending: mutation.isPending,
    hasChanges,
    hasAdditionalData,
    canSubmit: Boolean(initialData && parsedValues.success && hasChanges && !mutation.isPending),
    retry: () => void leadQuery.refetch(),
    cancel,
    back: () => navigate(`/prospectos/${id}`),
    submit: form.handleSubmit((data) => mutation.mutate(data)),
  };
}

export type LeadEditController = ReturnType<typeof useLeadEditFlow>;
