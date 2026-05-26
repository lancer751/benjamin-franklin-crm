import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { createLead, updateLead, getLeadById, createLeadExternal } from "../services/leadService";
import { getCampaigns } from "@/features/marketing/services/campaignService";
import { leadFormSchema, type LeadFormValues, defaultLeadFormValues } from "../schemas/leadFormSchema";

export const useLeadForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mode = id ? "edit" : "create";

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    mode: "onBlur",
    defaultValues: {
      ...defaultLeadFormValues,
    },
  });

  const { data: leadRes, isLoading: isLoadingLead, isError: isErrorLead } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => getLeadById(id as string),
    enabled: !!id,
  });

  const { data: campaignsRes, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: getCampaigns,
  });

  const rawCampaigns = Array.isArray(campaignsRes) 
    ? campaignsRes 
    : (campaignsRes as any)?.data || [];

  const activeCampaigns = rawCampaigns.filter((c: any) => c.status === "ACTIVE");

  // Auto-seleccionar la primera campaña activa si estamos en modo creación
  useEffect(() => {
    if (mode === "create" && activeCampaigns.length > 0) {
      const currentVal = form.getValues("primary_campaign_id");
      if (!currentVal || currentVal === "none" || currentVal === "") {
        form.setValue("primary_campaign_id", activeCampaigns[0].id);
      }
    }
  }, [activeCampaigns, mode, form]);

  useEffect(() => {
    if (mode === "create") {
      form.reset({
        ...defaultLeadFormValues,
        lead_status: "ACTIVE",
        source: "MANUAL",
        interaction_notes: "",
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
        source: "MANUAL",
        interaction_notes: "",
      });
    }
  }, [leadRes, mode, form]);

  const createMutation = useMutation({ mutationFn: createLead });
  const createExternalMutation = useMutation({ mutationFn: createLeadExternal });
  const updateMutation = useMutation({ mutationFn: (data: any) => updateLead(id as string, data) });

  const onSubmit = async (values: LeadFormValues) => {
    // Limpieza de DNI: Remover cualquier caracter que no sea número
    const cleanDni = values.dni?.replace(/\D/g, '') || null;

    const basePayload = {
      ...values,
      dni: cleanDni,
      gender: values.gender || null,
      secondary_email: values.secondary_email?.trim() ? values.secondary_email : null,
      address: values.address?.trim() ? values.address : null,
      second_address: values.second_address?.trim() ? values.second_address : null,
      profession: values.profession?.trim() ? values.profession : null,
      primary_campaign_id: (values.primary_campaign_id && values.primary_campaign_id !== "none") ? values.primary_campaign_id : undefined,
    };

    let mutationPromise;

    if (mode === "create") {
      if (values.source && values.source !== "MANUAL") {
        const externalPayload = {
          ...basePayload,
          source: values.source,
          lead_interaction: {
            interaction_type: "REGISTRATION",
            notes: values.interaction_notes || `Registro manual vía ${values.source}`,
            direction: "INBOUND",
            campaing_id: basePayload.primary_campaign_id,
          }
        };
        mutationPromise = createExternalMutation.mutateAsync(externalPayload as any);
      } else {
        mutationPromise = createMutation.mutateAsync(basePayload as any);
      }
    } else {
      mutationPromise = updateMutation.mutateAsync(basePayload as any);
    }

    toast.promise(mutationPromise, {
      loading: mode === "create" ? "Creando prospecto..." : "Actualizando prospecto...",
      success: () => {
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        if (id) queryClient.invalidateQueries({ queryKey: ["lead", id] });
        navigate("/prospectos");
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
    isLoadingCampaigns,
    activeCampaigns,
    isPending: createMutation.isPending || createExternalMutation.isPending || updateMutation.isPending,
    onSubmit,
  };
};
