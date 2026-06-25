import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { getCampaigns } from "@/features/campaigns/services/campaignService";
import {
  createLead,
  updateLead,
  getLeadById,
  addLeadToCampaign,
  createMemberInteraction,
  getAllLeads,
  type UpdateLeadReq
} from "../services/leadService";
import { leadFormSchema, type LeadFormValues, defaultLeadFormValues } from "../schemas/leadFormSchema";

export const useSalesForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const mode = id ? "edit" : "create";
  const { user } = useAuthStore();
  const sellerId = user?.seller?.id || user?.id;

  const form = useForm<LeadFormValues>({
    resolver: standardSchemaResolver(leadFormSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      ...defaultLeadFormValues,
      source: "WHATSAPP", // default to WHATSAPP as MANUAL is not allowed by campaign member source backend schema
    },
  });

  // 1. Fetch lead details if editing
  const { data: leadRes, isLoading: isLoadingLead, isError: isErrorLead } = useQuery({
    queryKey: ["lead", id],
    queryFn: () => getLeadById(id as string),
    enabled: !!id,
  });

  // 2. Fetch campaigns list
  const { data: campaignsRes, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => getCampaigns(),
  });

  const rawCampaigns = campaignsRes?.data?.data || [];
  const activeCampaigns = rawCampaigns.filter((c: any) => c.status === "ACTIVE");

  // Auto-select the first active campaign in creation mode
  useEffect(() => {
    if (mode === "create" && activeCampaigns.length > 0) {
      const currentVal = form.getValues("primary_campaign_id");
      if (!currentVal || currentVal === "none" || currentVal === "") {
        form.setValue("primary_campaign_id", activeCampaigns[0].id);
      }
    }
  }, [activeCampaigns, mode, form]);

  // Handle form reset on load / changes
  useEffect(() => {
    if (mode === "create") {
      form.reset({
        ...defaultLeadFormValues,
        lead_status: "ACTIVE",
        source: "WHATSAPP",
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
        source: (data as any).source || "WHATSAPP",
        interaction_notes: "",
      });
    }
  }, [leadRes, mode, form]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateLeadReq) => updateLead(id as string, data)
  });

  const onSubmit = async (values: LeadFormValues) => {
    form.clearErrors();

    if (mode === "create") {
      // Clean and build base payload for creation
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

      const creationPromise = (async () => {
        // Verify campaign is selected
        const campaignId = values.primary_campaign_id;
        if (!campaignId || campaignId === "none") {
          throw new Error("Se requiere seleccionar una campaña válida para registrar al prospecto.");
        }

        if (!user?.id) {
          throw new Error("El asesor no está autenticado.");
        }

        // 1. VERIFICACIÓN PREVIA DE DUPLICADOS (Bypass al 409):
        const searchRes = await getAllLeads({ search: values.email });
        const existingLeads = searchRes?.data?.data || searchRes?.data || [];
        const duplicateLead = existingLeads.find(
          (l: any) => l.email?.toLowerCase() === values.email.toLowerCase()
        );

        // 2. BIFURCACIÓN DE FLUJO ASÍNCRONO:
        let leadId: string | null = null;
        if (!duplicateLead) {
          // ESCENARIO A (Es un Lead Nuevo):
          const leadCreationRes = await createLead(exactBackendPayload as any);
          if (!leadCreationRes.success || !leadCreationRes.data?.id) {
            throw new Error(leadCreationRes.message || "No se pudo registrar los datos base del prospecto.");
          }
          leadId = leadCreationRes.data.id;
        } else {
          // ESCENARIO B (Es un Lead Antiguo):
          leadId = duplicateLead.id;
        }

        if (!leadId) {
          throw new Error("No se pudo obtener el ID del prospecto.");
        }

        // 3. VINCULACIÓN INMEDIATA A LA CAMPAÑA (POST /campaigns/:campaignId/members):
        const memberRes = await addLeadToCampaign(campaignId, {
          lead_id: leadId,
          campaing_id: campaignId, // Mantener typo del backend con 'g'
          assigned_to: sellerId, // ID comercial de ventas o ID de usuario alterno
          source: values.source || "WHATSAPP",
          is_primary: true
        });

        if (!memberRes.success || !memberRes.data?.id) {
          throw new Error(memberRes.message || "Error al asignar el prospecto a la campaña.");
        }
        const memberId = memberRes.data.id;

        // 4. FLUJO DE SEGUIMIENTO (Interacciones):
        const notes = values.interaction_notes?.trim();
        if (notes && notes.length >= 4) {
          await createMemberInteraction(
            campaignId,
            memberId,
            notes,
            "CALL", // Default interaction type
            user.id
          );
        }

        return { success: true, data: { id: leadId } };
      })();

      toast.promise(creationPromise, {
        loading: "Registrando y asignando prospecto...",
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["leads"] });
          navigate("/prospectos");
          return "Prospecto registrado y asignado exitosamente.";
        },
        error: (err: any) => err?.message || "Ocurrió un error al registrar el prospecto.",
      });

    } else {
      // Edit mode (Update Lead)
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

      const updatePromise = updateMutation.mutateAsync(updatePayload as any);

      toast.promise(updatePromise, {
        loading: "Actualizando datos del prospecto...",
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["leads"] });
          if (id) queryClient.invalidateQueries({ queryKey: ["lead", id] });
          navigate("/prospectos");
          return "Prospecto actualizado correctamente.";
        },
        error: () => "Hubo un error al actualizar el prospecto. Revisa los datos.",
      });
    }
  };

  return {
    form,
    mode,
    isLoadingLead,
    isErrorLead,
    isLoadingCampaigns,
    activeCampaigns,
    isPending: updateMutation.isPending, // Pending state is only from update mutation (creation uses custom promise chaining)
    onSubmit,
  };
};
