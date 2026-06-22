import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCampaignMembers } from "../services/leadService";
import { getCampaigns } from "@/features/marketing/services/campaignService";
import { useAuthStore } from "@/store/useAuthStore";
import { useSearchStore } from "@/store/useSearchStore";
import { adaptCampaignMembers, unpackLeads } from "../adapters/leadAdapter";
import { filterLeads, DateRangeFilter } from "../utils/leadLogic";

export const useSalesProspects = () => {
  // 🌟 Estados de Filtros
  const [tipificationFilter, setTipificationFilter] = useState("ALL");
  const [genderFilter, setGenderFilter] = useState("ALL");

  // Rango de fechas avanzado
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [dateRangeType, setDateRangeType] = useState<DateRangeFilter["type"]>("ALL");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");

  const popoverRef = useRef<HTMLDivElement>(null);

  // 🔍 Configuración del buscador global
  const { searchQuery, setSearchQuery, setPlaceholder } = useSearchStore();

  useEffect(() => {
    setPlaceholder("Buscar por nombre, apellido o email...");
    return () => {
      setSearchQuery(""); // Limpia el buscador al desmontar la vista
    };
  }, [setPlaceholder, setSearchQuery]);

  // Cerrar el Popover automáticamente si el usuario hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { user } = useAuthStore();
  const sellerId = user?.seller?.id || user?.id;

  // 1. Consultar y recopilar las campañas disponibles
  const { data: campaignsRes, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ["campaigns-list"],
    queryFn: () => getCampaigns(),
  });
  const campaigns = campaignsRes?.data?.data || [];
  const activeCampaigns = useMemo(() => {
    return campaigns.filter((c: any) => c.status === "ACTIVE");
  }, [campaigns]);

  // 2. Controlar la campaña seleccionada (Estado Local)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");

  // Efecto para pre-seleccionar automáticamente la primera campaña
  useEffect(() => {
    if (activeCampaigns.length > 0 && !selectedCampaignId) {
      setSelectedCampaignId(activeCampaigns[0].id);
    }
  }, [activeCampaigns, selectedCampaignId]);

  // 3. Query principal de miembros de campaña para el vendedor
  const { data: serverRes, isLoading: isLoadingLeads, isError } = useQuery({
    queryKey: ["leads", "sales", selectedCampaignId, sellerId],
    queryFn: () => getCampaignMembers(selectedCampaignId, { assigned_to: sellerId }),
    enabled: !!selectedCampaignId,
  });

  // Aplanamiento y normalización de datos
  const leads = useMemo(() => {
    const rawData = unpackLeads(serverRes);
    return adaptCampaignMembers(rawData);
  }, [serverRes]);

  // Lógica de Filtrado Avanzada
  const filteredLeads = useMemo(() => {
    return filterLeads(leads, {
      tipification: tipificationFilter,
      gender: genderFilter,
      dateRange: {
        type: dateRangeType,
        customStartDate,
        customEndDate,
      },
      searchQuery,
    });
  }, [leads, tipificationFilter, genderFilter, dateRangeType, customStartDate, customEndDate, searchQuery]);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const getDateRangeLabel = () => {
    if (dateRangeType === "ALL") return "Cualquier fecha";
    if (dateRangeType === "TODAY") return "Hoy";
    if (dateRangeType === "YESTERDAY") return "Ayer";
    if (dateRangeType === "LAST_7_DAYS") return "Últimos 7 días";
    if (dateRangeType === "THIS_MONTH") return "Este mes";
    if (dateRangeType === "CUSTOM") {
      if (customStartDate && customEndDate) {
        return `${formatDisplayDate(customStartDate)} - ${formatDisplayDate(customEndDate)}`;
      }
      if (customStartDate) return `Desde ${formatDisplayDate(customStartDate)}`;
      if (customEndDate) return `Hasta ${formatDisplayDate(customEndDate)}`;
      return "Personalizado";
    }
    return "Cualquier fecha";
  };

  const handleQuickSelect = (type: typeof dateRangeType) => {
    setDateRangeType(type);
    setCustomStartDate("");
    setCustomEndDate("");
    setTempStartDate("");
    setTempEndDate("");
    setIsPopoverOpen(false);
  };

  const handleApplyCustomRange = () => {
    setDateRangeType("CUSTOM");
    setCustomStartDate(tempStartDate);
    setCustomEndDate(tempEndDate);
    setIsPopoverOpen(false);
  };

  const hasActiveFilters = dateRangeType !== "ALL" || tipificationFilter !== "ALL" || genderFilter !== "ALL";

  const handleResetFilters = () => {
    setDateRangeType("ALL");
    setCustomStartDate("");
    setCustomEndDate("");
    setTempStartDate("");
    setTempEndDate("");
    setTipificationFilter("ALL");
    setGenderFilter("ALL");
  };

  return {
    tipificationFilter,
    setTipificationFilter,
    genderFilter,
    setGenderFilter,
    isPopoverOpen,
    setIsPopoverOpen,
    dateRangeType,
    tempStartDate,
    setTempStartDate,
    tempEndDate,
    setTempEndDate,
    popoverRef,
    selectedCampaignId,
    setSelectedCampaignId,
    activeCampaigns,
    isLoadingCampaigns,
    leads,
    filteredLeads,
    isLoading: isLoadingLeads,
    isError,
    getDateRangeLabel,
    handleQuickSelect,
    handleApplyCustomRange,
    hasActiveFilters,
    handleResetFilters,
  };
};
