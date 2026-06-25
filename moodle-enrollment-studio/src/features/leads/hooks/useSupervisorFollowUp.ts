import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAllLeads } from "../services/leadService";
import { reassignCampaignMember } from "@/features/campaigns/services/campaignService";
import { api } from "@/core/lib/api";
import { adaptLeads, unpackLeads } from "../adapters/leadAdapter";
import { extractSellers, calculateSupervisorKPIs, getActiveMembersForSeller } from "../utils/leadLogic";
import { getSellers } from "@/features/users/services/userService";

export const useSupervisorFollowUp = () => {
  const queryClient = useQueryClient();

  const [activeSellerTab, setActiveSellerTab] = useState<string>("");
  const [selectedLead, setSelectedLead] = useState<any>(null);

  // 1. Obtener todos los prospectos de la academia
  const { data: leadsRes, isLoading: isLoadingLeads } = useQuery({
    queryKey: ["all-leads"],
    queryFn: () => getAllLeads(),
  });

  const leads = useMemo(() => {
    const rawData = unpackLeads(leadsRes);
    return adaptLeads(rawData);
  }, [leadsRes]);

  // 1b. Obtener todos los vendedores reales
  const { data: realSellersRes } = useQuery({
    queryKey: ["real-sellers-list"],
    queryFn: getSellers,
    staleTime: 10 * 60 * 1000,
  });

  const realSellers = useMemo(() => {
    return (realSellersRes as any)?.success ? (realSellersRes as any).data : (realSellersRes || []);
  }, [realSellersRes]);

  // 2. Extraer de forma dinámica un listado único de asesores
  const sellers = useMemo(() => {
    return extractSellers(leads);
  }, [leads]);

  // Inicializar pestaña con el primer asesor encontrado en la data real
  useEffect(() => {
    if (sellers.length && !activeSellerTab) {
      setActiveSellerTab(sellers[0].id);
    }
  }, [sellers, activeSellerTab]);

  // 3. Filtrar los prospectos asignados al asesor seleccionado
  const activeMembers = useMemo(() => {
    return getActiveMembersForSeller(leads, activeSellerTab);
  }, [leads, activeSellerTab]);

  // Obtener interacciones del prospecto seleccionado para el Sheet lateral
  const { data: interactionsRes, isLoading: isLoadingInteractions } = useQuery({
    queryKey: ["member-interactions", selectedLead?.id],
    queryFn: async () => {
      if (!selectedLead) return null;
      const res = await api.campaigns[":campaignId"]["members"][":memberId"]["interactions"].$get({
        param: { 
          campaignId: selectedLead.campaignId || selectedLead.campaing_id || selectedLead.campaing?.id, 
          memberId: selectedLead.id 
        }
      });
      return res.json();
    },
    enabled: !!selectedLead?.id && !selectedLead.id.startsWith("unassigned-"),
  });

  // Reasignar asesor comercial mutation
  const reassignMutation = useMutation({
    mutationFn: async (newSellerId: string) => {
      if (selectedLead.id.startsWith("unassigned-")) {
        const campaignId = selectedLead.campaing_id || selectedLead.lead.primary_campaign_id;
        if (!campaignId) {
          throw new Error("El prospecto no tiene una campaña asociada.");
        }
        const res = await api.campaigns[":campaignId"].members.$post({
          param: { campaignId },
          json: {
            lead_id: selectedLead.lead.id,
            campaing_id: campaignId,
            assigned_to: newSellerId,
            source: selectedLead.lead.source || "WHATSAPP",
            is_primary: true
          }
        });
        return await res.json();
      }
      return reassignCampaignMember(
        selectedLead.campaing_id || selectedLead.campaing?.id, 
        selectedLead.id, 
        { assigned_to: newSellerId }
      );
    },
    onSuccess: (res: any) => {
      if (res.success) {
        toast.success("Prospecto reasignado al nuevo asesor comercial");
        setSelectedLead(null);
        queryClient.invalidateQueries({ queryKey: ["all-leads"] });
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      } else {
        toast.error(res.message || "Error al reasignar prospecto");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error al reasignar prospecto");
    }
  });

  // Información del asesor activo
  const activeSeller = useMemo(() => {
    return sellers.find(s => s.id === activeSellerTab) || null;
  }, [sellers, activeSellerTab]);

  // KPIs dinámicos calculados desde la base de datos de leads
  const kpis = useMemo(() => {
    return calculateSupervisorKPIs(leads, sellers);
  }, [leads, sellers]);

  return {
    sellers,
    activeSellerTab,
    setActiveSellerTab,
    activeSeller,
    activeMembers,
    isLoadingLeads,
    selectedLead,
    setSelectedLead,
    interactionsRes,
    isLoadingInteractions,
    reassignMutation,
    kpis,
    realSellers,
  };
};
