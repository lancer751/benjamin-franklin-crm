import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createLead, updateLead, getLeadById } from "../services/leadService";
import { leadFormSchema, type LeadFormValues, defaultLeadFormValues } from "../schemas/leadFormSchema";

export const useLeadFormModal = (open: boolean, onClose: () => void, leadId?: string | null) => {
  const queryClient = useQueryClient();
  const mode = leadId ? "edit" : "create";

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    mode: "onBlur",
    defaultValues: {
      ...defaultLeadFormValues,
    },
  });

  const { data: leadRes, isLoading: isLoadingLead, isError: isErrorLead } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => getLeadById(leadId as string),
    enabled: !!leadId && open,
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      return;
    }

    if (mode === "create") {
      form.reset({
        ...defaultLeadFormValues,
        lead_status: "ACTIVE",
      });
    } else if (leadRes?.success) {
      const data = leadRes.data;
      form.reset({
        first_name: data.first_name || "",
        middle_name: data.middle_name || "",
        last_name: data.last_name || "",
        dni: data.dni || "",
        gender: data.gender || "NOT_SPECIFIED",
        email: data.email || "",
        secondary_email: data.secondary_email || "",
        phone: data.phone || "",
        address: data.address || "",
        second_address: data.second_address || "",
        profession: data.profession || "",
        primary_campaign_id: data.primary_campaign_id || "",
        lead_status: data.lead_status || "ACTIVE",
      });
    }
  }, [open, leadRes, mode, form]);

  const createMutation = useMutation({ mutationFn: createLead });
  const updateMutation = useMutation({ mutationFn: (data: any) => updateLead(leadId as string, data) });

  const onSubmit = async (values: LeadFormValues) => {
    const payload = {
      ...values,
      dni: values.dni?.trim() ? values.dni : null,
      gender: values.gender || null,
      secondary_email: values.secondary_email?.trim() ? values.secondary_email : null,
      address: values.address?.trim() ? values.address : null,
      second_address: values.second_address?.trim() ? values.second_address : null,
      profession: values.profession?.trim() ? values.profession : null,
      primary_campaign_id: values.primary_campaign_id?.trim() ? values.primary_campaign_id : null,
    };

    const mutationPromise = mode === "create" 
      ? createMutation.mutateAsync(payload as any)
      : updateMutation.mutateAsync(payload as any);

    toast.promise(mutationPromise, {
      loading: mode === "create" ? "Creando prospecto..." : "Actualizando prospecto...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        if (leadId) queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
        onClose();
        return mode === "create" ? "Prospecto creado exitosamente" : "Prospecto actualizado correctamente";
      },
      error: () => "Hubo un error al guardar el prospecto. Revisa los datos.",
    });
  };

  return {
    form,
    mode,
    isLoadingLead,
    isErrorLead,
    isPending: createMutation.isPending || updateMutation.isPending,
    onSubmit,
  };
};
