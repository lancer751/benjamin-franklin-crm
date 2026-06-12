import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"; // ✅ cambia esto
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { createLead, updateLead, getLeadById, type UpdateLeadReq } from "../services/leadService";
import { getCampaigns } from "@/features/marketing/services/campaignService";
import { leadFormSchema, type LeadFormValues, defaultLeadFormValues } from "../schemas/leadFormSchema";

export const useLeadForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mode = id ? "edit" : "create";

const form = useForm<LeadFormValues>({
  resolver: standardSchemaResolver(leadFormSchema), // ✅ cambia esto
  mode: "onSubmit",
  reValidateMode: "onChange",
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
    queryFn: () => getCampaigns(),
  });

  const rawCampaigns = campaignsRes?.data?.data || [];

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
        cellphone: data.cellphone || "",
        address: data.address || "",
        second_address: data.second_address || "",
        profession: data.profession || "",
        primary_campaign_id: data.primary_campaign_id || "",
        lead_status: data.lead_status || "ACTIVE",
        source: (data as any).source || "MANUAL",
        interaction_notes: "",
      });
    }
  }, [leadRes, mode, form]);

  const createMutation = useMutation({ mutationFn: createLead });
  const updateMutation = useMutation({ 
    mutationFn: (data: UpdateLeadReq) => updateLead(id as string, data) 
  });

  const onSubmit = async (values: LeadFormValues) => {
    const basePayload = {
      ...values,
      dni: values.dni?.replace(/\D/g, '') || null,
      primary_campaign_id: (values.primary_campaign_id && values.primary_campaign_id !== "none") ? values.primary_campaign_id : undefined,
      phones: [
        {
          number: values.cellphone ? values.cellphone.replace(/\D/g, "") : "",
          type: "WHATSAPP" as const
        }
      ]
    };

    let mutationPromise;

    if (mode === "create") {
      mutationPromise = createMutation.mutateAsync(basePayload as any);
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
    isPending: createMutation.isPending || updateMutation.isPending,
    onSubmit,
  };
};
