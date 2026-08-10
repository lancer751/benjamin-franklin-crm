import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getCampaignById,
  getCampaigns,
} from "@/features/campaigns/services/campaignService";
import { getSellers, getSellerCampaigns } from "@/features/users/services/userService";
import {
  adaptAllowedCampaigns,
  adaptSellerCampaigns,
  type LeadQuickCampaignOption,
  type LeadQuickSellerOption,
} from "../adapters/leadQuickFormAdapter";
import {
  leadQuickFormSchema,
  defaultLeadQuickFormValues,
  type LeadQuickFormData,
  type LeadQuickFormInput,
} from "../schemas/leadQuickFormSchema";
import {
  addLeadToCampaign,
  createLead,
  createMemberInteraction,
  lookupLeadExact,
} from "../services/leadService";
import { buildCreateLeadPayload } from "../adapters/leadQuickFormAdapter";
import { mapInteractionFormToPayload } from "../utils/leadActionPayloadMappers";
import { interpretLeadLookup, useManualLeadLookup } from "./useManualLeadRegistration";
import { campaignQueryKeys } from "@/features/campaigns/queryKeys";
import { sellerKeys } from "@/features/users/queryKeys";
import { campaignMemberKeys, leadKeys } from "../queryKeys";

interface MutationResponse {
  success?: boolean;
  data?: { id?: string };
  message?: string;
  error?: string;
}

const asMutationResponse = (value: unknown): MutationResponse =>
  value && typeof value === "object" ? value as MutationResponse : {};

const requireCreatedId = (value: unknown, fallbackMessage: string): string => {
  const response = asMutationResponse(value);
  if (response.success && response.data?.id) return response.data.id;
  throw new Error(response.message || response.error || fallbackMessage);
};

class LeadAlreadyInCampaignError extends Error {
  constructor(public readonly leadId: string) {
    super("Este prospecto ya pertenece a la campaña seleccionada.");
  }
}

export function useLeadCreationFlow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const role = user?.role?.name ?? "";
  const isSalesRep = role === "SALES_REP";
  const canChooseSeller = role === "ADMIN"
    || role === "SALES_SUPERVISOR"
    || role === "SUPERVISOR"
    || role === "MARKETING";
  const authenticatedSellerProfileId = user?.seller?.id || "";
  const authenticatedUserId = user?.id || "";

  const urlCampaignId = searchParams.get("campaignId")?.trim() || "";
  const urlAdvisorUserId = searchParams.get("advisorUserId")?.trim() || "";
  const rawReturnTo = searchParams.get("returnTo")?.trim() || "";
  const safeReturnTo = rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//") ? rawReturnTo : "";
  const isContextualMode = Boolean(urlCampaignId);
  const isContextualAdvisorMode = Boolean(urlCampaignId && urlAdvisorUserId);

  const [flowError, setFlowError] = useState("");
  const submitLock = useRef(false);

  const form = useForm<LeadQuickFormInput, unknown, LeadQuickFormData>({
    resolver: standardSchemaResolver(leadQuickFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: defaultLeadQuickFormValues,
  });

  const values = form.watch();
  const campaignId = values.campaignId;
  const selectedAssignedUserId = isSalesRep ? authenticatedUserId : values.sellerId;

  // Contextual Campaign Fetch
  const contextualCampaignQuery = useQuery({
    queryKey: campaignQueryKeys.detail(urlCampaignId),
    queryFn: () => getCampaignById(urlCampaignId),
    enabled: isContextualMode && Boolean(user),
  });

  const contextualCampaignData = useMemo(() => {
    if (!contextualCampaignQuery.data) return null;
    const res = contextualCampaignQuery.data as Record<string, unknown>;
    return (res.data as Record<string, unknown>) || res;
  }, [contextualCampaignQuery.data]);

  const contextualCampaignName = useMemo(() => {
    if (!contextualCampaignData) return "Campaña";
    return (contextualCampaignData.name as string) || "Campaña";
  }, [contextualCampaignData]);

  const contextualSellers: LeadQuickSellerOption[] = useMemo(() => {
    if (!contextualCampaignData || !Array.isArray(contextualCampaignData.sellersOnCampaign)) return [];
    return contextualCampaignData.sellersOnCampaign.flatMap((cs: unknown) => {
      if (typeof cs !== "object" || cs === null) return [];
      const assignment = cs as Record<string, unknown>;
      const seller = typeof assignment.seller === "object" && assignment.seller !== null
        ? (assignment.seller as Record<string, unknown>)
        : {};
      const userObj = typeof seller.user === "object" && seller.user !== null
        ? (seller.user as Record<string, unknown>)
        : {};
      if (userObj.is_active === false) return [];
      const userId = typeof userObj.id === "string" ? userObj.id : typeof seller.user_id === "string" ? seller.user_id : "";
      const sellerProfileId = typeof assignment.seller_id === "string" ? assignment.seller_id : typeof seller.id === "string" ? seller.id : "";
      if (!userId || !sellerProfileId) return [];
      const firstName = typeof userObj.first_name === "string" ? userObj.first_name : "";
      const lastName = typeof userObj.last_name === "string" ? userObj.last_name : "";
      const name = `${firstName} ${lastName}`.trim() || "Asesor sin nombre";
      return [{ userId, sellerProfileId, name }];
    }).sort((first, second) => first.name.localeCompare(second.name, "es"));
  }, [contextualCampaignData]);

  // Advisor validation for contextual advisor mode
  const contextualAdvisorOption = useMemo(() => {
    if (!urlAdvisorUserId) return null;
    return contextualSellers.find((seller) => seller.userId === urlAdvisorUserId) || null;
  }, [contextualSellers, urlAdvisorUserId]);

  const isAdvisorValidInCampaign = isContextualAdvisorMode
    ? Boolean(contextualAdvisorOption)
    : true;

  // Global Queries (only if not in contextual mode)
  const sellerCampaignsQuery = useQuery({
    queryKey: sellerKeys.campaigns(authenticatedSellerProfileId),
    queryFn: () => getSellerCampaigns(authenticatedSellerProfileId),
    enabled: !isContextualMode && isSalesRep && Boolean(authenticatedSellerProfileId),
  });
  const allowedCampaignsQuery = useQuery({
    queryKey: campaignQueryKeys.list({ page: "1", limit: "100" }),
    queryFn: () => getCampaigns({ page: "1", limit: "100" }),
    enabled: !isContextualMode && Boolean(user) && !isSalesRep,
  });
  const sellersQuery = useQuery({
    queryKey: sellerKeys.list(),
    queryFn: getSellers,
    enabled: !isContextualMode && Boolean(user) && canChooseSeller && !isSalesRep,
  });

  const campaigns = useMemo<LeadQuickCampaignOption[]>(() => {
    if (isContextualMode) {
      return [{
        id: urlCampaignId,
        name: contextualCampaignName,
        platform: "",
        sellers: contextualSellers,
      }];
    }
    return isSalesRep
      ? adaptSellerCampaigns(sellerCampaignsQuery.data)
      : adaptAllowedCampaigns(allowedCampaignsQuery.data, sellersQuery.data);
  }, [allowedCampaignsQuery.data, isContextualMode, isSalesRep, sellerCampaignsQuery.data, sellersQuery.data, urlCampaignId, contextualCampaignName, contextualSellers]);

  const selectedCampaign = campaigns.find((campaign) => campaign.id === campaignId);

  const sellerOptions = useMemo<LeadQuickSellerOption[]>(() => {
    if (isContextualMode) return contextualSellers;
    return canChooseSeller ? selectedCampaign?.sellers || [] : [];
  }, [canChooseSeller, isContextualMode, contextualSellers, selectedCampaign?.sellers]);

  const isLoadingSellers = isContextualMode
    ? contextualCampaignQuery.isLoading
    : (canChooseSeller && Boolean(campaignId) && (allowedCampaignsQuery.isLoading || sellersQuery.isLoading));

  const sellerOptionsError = isContextualMode
    ? (contextualCampaignQuery.isError || (!contextualCampaignQuery.isLoading && !contextualCampaignData))
    : (canChooseSeller && Boolean(campaignId) && (allowedCampaignsQuery.isError || sellersQuery.isError));

  // Initialize campaign value in contextual mode
  useEffect(() => {
    if (urlCampaignId) {
      form.setValue("campaignId", urlCampaignId, { shouldValidate: true });
    }
  }, [urlCampaignId, form]);

  useEffect(() => {
    if (isSalesRep && authenticatedUserId) {
      form.setValue("sellerId", authenticatedUserId, { shouldValidate: true });
    }
  }, [authenticatedUserId, form, isSalesRep]);

  // Contextual single seller / specific advisor auto-selection & validation
  useEffect(() => {
    if (isContextualAdvisorMode && !contextualCampaignQuery.isLoading && canChooseSeller && !isSalesRep) {
      if (contextualAdvisorOption) {
        if (form.getValues("sellerId") !== contextualAdvisorOption.userId) {
          form.setValue("sellerId", contextualAdvisorOption.userId, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
        form.clearErrors("sellerId");
      } else {
        form.setValue("sellerId", "", { shouldDirty: true });
      }
      return;
    }

    if (isContextualMode && !contextualCampaignQuery.isLoading && canChooseSeller && !isSalesRep) {
      if (contextualSellers.length === 1) {
        const singleSeller = contextualSellers[0];
        if (form.getValues("sellerId") !== singleSeller.userId) {
          form.setValue("sellerId", singleSeller.userId, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
        form.clearErrors("sellerId");
        return;
      }
      if (contextualSellers.length > 1) {
        const currentSellerId = form.getValues("sellerId") || "";
        if (currentSellerId && !contextualSellers.some((seller) => seller.userId === currentSellerId)) {
          form.setValue("sellerId", "", { shouldDirty: true });
          form.clearErrors("sellerId");
        }
      }
      return;
    }

    if (!isContextualMode && canChooseSeller && campaignId && !isLoadingSellers && !sellerOptionsError) {
      const currentSellerId = form.getValues("sellerId") || "";
      if (sellerOptions.length === 1) {
        const onlySeller = sellerOptions[0];
        if (currentSellerId !== onlySeller.userId) {
          form.setValue("sellerId", onlySeller.userId, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
        form.clearErrors("sellerId");
        return;
      }
      if (currentSellerId && !sellerOptions.some((seller) => seller.userId === currentSellerId)) {
        form.setValue("sellerId", "", { shouldDirty: true });
        form.clearErrors("sellerId");
      }
    }
  }, [campaignId, canChooseSeller, contextualAdvisorOption, contextualCampaignQuery.isLoading, contextualSellers, form, isContextualAdvisorMode, isContextualMode, isLoadingSellers, isSalesRep, sellerOptions, sellerOptionsError]);

  useEffect(() => {
    setFlowError("");
  }, [campaignId, selectedAssignedUserId, values.cellphone, values.email]);

  const selectedSeller = sellerOptions.find((seller) => seller.userId === selectedAssignedUserId);
  const selectedSellerProfileId = isSalesRep
    ? authenticatedSellerProfileId
    : selectedSeller?.sellerProfileId || "";

  const lookupState = useManualLeadLookup(
    { cellphone: values.cellphone, email: values.email },
    campaignId,
    selectedSellerProfileId,
    Boolean(campaignId && selectedSellerProfileId),
  );
  const lookup = lookupState.lookup;
  const leadLookupState = lookupState.state;
  const hasIdentityConflict = leadLookupState.status === "error"
    && leadLookupState.message.includes("pertenecen a prospectos diferentes");
  const existingLead = lookup?.success && lookup.data?.found ? lookup.data.lead : null;
  const existingMemberId = leadLookupState.status === "existing-in-campaign"
    ? leadLookupState.campaignMemberId
    : null;

  const registrationMutation = useMutation({
    mutationFn: async (data: LeadQuickFormData) => {
      const assignedUserId = isSalesRep ? authenticatedUserId : data.sellerId;
      const sellerProfileId = isSalesRep
        ? authenticatedSellerProfileId
        : sellerOptions.find((seller) => seller.userId === assignedUserId)?.sellerProfileId || "";
      if (!assignedUserId || !sellerProfileId) {
        throw new Error("Selecciona un asesor asignado a la campaña.");
      }

      const lookupArgs = {
        phone: data.cellphone,
        email: data.email,
        campaignId: data.campaignId,
        sellerProfileId,
      };

      const confirmedLookup = interpretLeadLookup(await lookupLeadExact(lookupArgs));
      if (confirmedLookup.status === "error") throw new Error(confirmedLookup.message);
      if (confirmedLookup.status === "idle" || confirmedLookup.status === "loading") {
        throw new Error("No fue posible confirmar el estado actual del prospecto.");
      }
      if (confirmedLookup.status === "existing-in-campaign") {
        throw new LeadAlreadyInCampaignError(confirmedLookup.leadId);
      }

      const mode: "created" | "linked" = confirmedLookup.status === "new" ? "created" : "linked";
      const leadId = confirmedLookup.status === "existing-unassigned"
        ? confirmedLookup.leadId
        : requireCreatedId(
          await createLead(buildCreateLeadPayload(data) as Parameters<typeof createLead>[0]),
          "No se pudo crear el prospecto.",
        );

      const memberId = requireCreatedId(await addLeadToCampaign(data.campaignId, {
        lead_id: leadId,
        campaing_id: data.campaignId,
        assigned_to: assignedUserId,
        source: data.source,
        is_primary: true,
      }), "No se pudo asociar el prospecto a la campaña.");

      try {
        const interactionPayload = mapInteractionFormToPayload({
          notes: data.notes,
          type: data.interactionType,
        });
        const interactionResponse = asMutationResponse(await createMemberInteraction(
          data.campaignId,
          memberId,
          interactionPayload.notes,
          interactionPayload.type,
          authenticatedUserId,
        ));
        if (!interactionResponse.success) {
          throw new Error(interactionResponse.message || interactionResponse.error || "No se pudo guardar la interacción inicial.");
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "No se pudo guardar la interacción inicial.";
        throw new Error(`El prospecto fue asociado a la campaña, pero no se pudo guardar la interacción inicial: ${message}`);
      }

      return { leadId, memberId, mode };
    },
    onMutate: () => setFlowError(""),
    onError: (error) => {
      const message = error instanceof Error ? error.message : "No se pudo registrar el prospecto.";
      setFlowError(message);
      if (error instanceof LeadAlreadyInCampaignError) toast.warning(message);
    },
    onSettled: () => { submitLock.current = false; },
    onSuccess: async ({ leadId, mode }) => {
      const targetCampaignId = campaignId || urlCampaignId;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: leadKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: campaignMemberKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: campaignQueryKeys.detail(targetCampaignId) }),
        queryClient.invalidateQueries({ queryKey: sellerKeys.details() }),
        queryClient.invalidateQueries({ queryKey: leadKeys.detail(leadId) }),
      ]);
      toast.success(mode === "created"
        ? "Prospecto registrado y asociado a la campaña."
        : "Prospecto existente asociado a la campaña.");
      if (safeReturnTo) {
        navigate(safeReturnTo);
      } else if (isContextualMode && targetCampaignId) {
        navigate(`/campanas/${targetCampaignId}`);
      } else {
        navigate(`/prospectos/${leadId}`);
      }
    },
  });

  const schemaIsValid = leadQuickFormSchema.safeParse(values).success;
  const sellerIsValid = isSalesRep
    ? Boolean(authenticatedUserId && authenticatedSellerProfileId)
    : Boolean(values.sellerId && sellerOptions.some((seller) => seller.userId === values.sellerId)) && isAdvisorValidInCampaign;
  const canSubmit = schemaIsValid
    && sellerIsValid
    && !isLoadingSellers
    && !sellerOptionsError
    && (leadLookupState.status === "new" || leadLookupState.status === "existing-unassigned")
    && !registrationMutation.isPending;
  const actionLabel = leadLookupState.status === "existing-in-campaign"
    ? "Ya está en la campaña"
    : leadLookupState.status === "existing-unassigned"
      ? "Agregar a la campaña"
      : "Registrar prospecto";
  const pendingLabel = leadLookupState.status === "existing-unassigned" ? "Agregando…" : "Registrando…";

  return {
    form,
    role,
    isSalesRep,
    canChooseSeller,
    isContextualMode,
    isContextualAdvisorMode,
    isAdvisorValidInCampaign,
    contextualSellerName: contextualAdvisorOption?.name || "",
    contextualCampaignName,
    safeReturnTo,
    campaigns,
    sellerOptions,
    isLoadingSellers,
    sellerOptionsError,
    isLoadingCampaigns: isContextualMode ? contextualCampaignQuery.isLoading : (isSalesRep ? sellerCampaignsQuery.isLoading : allowedCampaignsQuery.isLoading),
    campaignError: isContextualMode ? contextualCampaignQuery.isError : (isSalesRep ? sellerCampaignsQuery.isError : allowedCampaignsQuery.isError),
    lookup,
    lookupState,
    leadLookupState,
    hasIdentityConflict,
    existingLead,
    existingMemberId,
    flowError,
    canSubmit,
    actionLabel,
    pendingLabel,
    isRegistering: registrationMutation.isPending,
    onSubmit: form.handleSubmit((data) => {
      if (submitLock.current || registrationMutation.isPending) return;
      submitLock.current = true;
      registrationMutation.mutate(data);
    }),
    cancel: () => {
      if (safeReturnTo) {
        navigate(safeReturnTo);
      } else if (isContextualMode && urlCampaignId) {
        navigate(`/campanas/${urlCampaignId}`);
      } else {
        navigate("/prospectos");
      }
    },
    setCampaign: (newCampaignId: string) => {
      form.setValue("campaignId", newCampaignId, { shouldDirty: true, shouldValidate: true });
      if (!isSalesRep) form.setValue("sellerId", "", { shouldDirty: true });
    },
  };
}

export type LeadCreationController = ReturnType<typeof useLeadCreationFlow>;
