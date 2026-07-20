import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addLeadToCampaign,
  createLead,
  lookupLeadExact,
  type LeadLookupResponse,
} from "../services/leadService";
import {
  isValidLeadEmail,
  isValidLeadPhone,
  normalizeLeadEmail,
  normalizeLeadPhone,
  type ManualLeadData,
} from "../schemas/manualLeadSchema";

export class ManualLeadRegistrationError extends Error {
  constructor(
    message: string,
    public readonly code?: "LEAD_IDENTITY_CONFLICT" | "LEAD_ALREADY_IN_CAMPAIGN",
  ) {
    super(message);
  }
}

interface LookupValues {
  cellphone: string;
  email: string;
}

export function useManualLeadLookup(
  values: LookupValues,
  campaignId: string,
  sellerId: string | undefined,
  enabled: boolean,
) {
  const phone = normalizeLeadPhone(values.cellphone);
  const email = normalizeLeadEmail(values.email);
  const validPhone = isValidLeadPhone(phone) ? phone : undefined;
  const validEmail = isValidLeadEmail(email) ? email : undefined;
  const canLookup = Boolean(validPhone || validEmail);
  const [debouncedLookup, setDebouncedLookup] = useState<{ phone?: string; email?: string } | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setDebouncedLookup(null);
    if (!enabled || !campaignId || !sellerId || !canLookup) {
      setIsDebouncing(false);
      return;
    }

    setIsDebouncing(true);
    const timeoutId = window.setTimeout(() => {
      setDebouncedLookup({ phone: validPhone, email: validEmail });
      setIsDebouncing(false);
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [campaignId, sellerId, enabled, canLookup, validPhone, validEmail]);

  const lookupQuery = useQuery({
    queryKey: [
      "manual-lead-lookup",
      campaignId,
      sellerId,
      debouncedLookup?.phone ?? "",
      debouncedLookup?.email ?? "",
    ],
    queryFn: () => lookupLeadExact({
      phone: debouncedLookup?.phone,
      email: debouncedLookup?.email,
      campaignId,
      sellerId: sellerId!,
    }),
    enabled: Boolean(enabled && campaignId && sellerId && debouncedLookup),
  });

  const lookupIsCurrent = Boolean(
    debouncedLookup
    && debouncedLookup.phone === validPhone
    && debouncedLookup.email === validEmail,
  );

  return {
    lookup: lookupIsCurrent ? lookupQuery.data : undefined,
    isSearching: canLookup && (!lookupIsCurrent || isDebouncing || lookupQuery.isFetching),
    isLookupError: lookupQuery.isError,
    canLookup,
  };
}

const getExistingLead = (lookup: LeadLookupResponse) => {
  if (!lookup.success && lookup.code === "LEAD_IDENTITY_CONFLICT") {
    throw new ManualLeadRegistrationError(
      "El celular y el correo pertenecen a prospectos diferentes. Verifica los datos.",
      "LEAD_IDENTITY_CONFLICT",
    );
  }
  if (lookup.data?.campaign_member_id) {
    throw new ManualLeadRegistrationError(
      "Este prospecto ya está registrado en esta campaña.",
      "LEAD_ALREADY_IN_CAMPAIGN",
    );
  }
  return lookup.data?.found ? lookup.data.lead : null;
};

export function useManualLeadRegistration(campaignId: string, sellerId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ManualLeadData) => {
      if (!sellerId) throw new Error("No se identificó el perfil de asesor de ventas.");
      if (!campaignId) throw new Error("No hay una campaña activa seleccionada.");

      const lookupArgs = {
        phone: data.cellphone,
        email: data.email,
        campaignId,
        sellerId,
      };
      let existingLead = getExistingLead(await lookupLeadExact(lookupArgs));
      let leadId = existingLead?.id;
      let mode: "created" | "linked" = existingLead ? "linked" : "created";

      if (!leadId) {
        const leadResponse = await createLead({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phones: [{ number: data.cellphone, type: "WHATSAPP", isPrincipal: true }],
          lead_status: "ACTIVE",
          gender: "NOT_SPECIFIED",
        } as any, sellerId) as any;

        if (leadResponse.success && leadResponse.data?.id) {
          leadId = leadResponse.data.id;
        } else {
          const errorMessage = String(leadResponse.error || leadResponse.message || "");
          if (!errorMessage.includes("Email or principal phone number is already registered")) {
            throw new Error(errorMessage || "Error al crear los datos base del prospecto.");
          }

          existingLead = getExistingLead(await lookupLeadExact(lookupArgs));
          if (!existingLead?.id) {
            throw new Error("El prospecto ya existe, pero no fue posible recuperarlo de forma segura.");
          }
          leadId = existingLead.id;
          mode = "linked";
        }
      }

      const memberResponse = await addLeadToCampaign(campaignId, {
        lead_id: leadId,
        campaing_id: campaignId,
        assigned_to: sellerId,
        source: "WHATSAPP",
        is_primary: true,
      } as any, sellerId) as any;

      if (!memberResponse.success) {
        if (memberResponse.code === "LEAD_ALREADY_IN_CAMPAIGN") {
          throw new ManualLeadRegistrationError(
            "Este prospecto ya está registrado en esta campaña.",
            "LEAD_ALREADY_IN_CAMPAIGN",
          );
        }
        throw new Error(memberResponse.message || memberResponse.error || "Error al asociar el prospecto a la campaña.");
      }

      return { mode, member: memberResponse.data };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["campaign-members-seller", campaignId, sellerId] });
      await queryClient.invalidateQueries({ queryKey: ["campaign-members", campaignId] });
    },
  });
}
