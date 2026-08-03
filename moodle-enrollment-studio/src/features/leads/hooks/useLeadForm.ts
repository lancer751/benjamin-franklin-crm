import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { createLead, updateLead, getLeadById, type UpdateLeadReq } from "../services/leadService";
import { leadFormSchema, type LeadFormValues, defaultLeadFormValues } from "../schemas/leadFormSchema";

export const useLeadForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mode = id ? "edit" : "create";

  const form = useForm<LeadFormValues>({
    resolver: standardSchemaResolver(leadFormSchema),
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
        cellphone: data.phones?.[0]?.number || "",
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
    form.clearErrors();

    let mutationPromise;

    if (mode === "create") {
      const exactBackendPayload = {
        first_name: values.first_name,
        middle_name: values.middle_name || "",
        last_name: values.last_name,
        email: values.email,
        profession: values.profession || null,
        gender: values.gender || "NOT_SPECIFIED",
        address: values.address || null,
        secondary_email: values.secondary_email || null,
        dni: values.dni ? values.dni.replace(/\D/g, '') : null,
        phones: [
          { 
            number: values.cellphone ? values.cellphone.replace(/\D/g, "") : "", 
            type: "WHATSAPP" 
          }
        ]
      };
      mutationPromise = createMutation.mutateAsync(exactBackendPayload as any);
    } else {
      const updatePayload = {
        first_name: values.first_name,
        middle_name: values.middle_name || "",
        last_name: values.last_name,
        email: values.email,
        profession: values.profession || null,
        gender: values.gender || "NOT_SPECIFIED",
        address: values.address || null,
        secondary_email: values.secondary_email || null,
        dni: values.dni ? values.dni.replace(/\D/g, '') : null,
      };
      mutationPromise = updateMutation.mutateAsync(updatePayload as any);
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
    isPending: createMutation.isPending || updateMutation.isPending,
    onSubmit,
  };
};

