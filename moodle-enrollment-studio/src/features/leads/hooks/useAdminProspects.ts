import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllLeads } from "../services/leadService";
import { useSearchStore } from "@/store/useSearchStore";
import { toast } from "sonner";
import { adaptLeads, unpackLeads } from "../adapters/leadAdapter";
import { filterLeads, DateRangeFilter } from "../utils/leadLogic";

export const useAdminProspects = () => {
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

  const [leadToDeleteId, setLeadToDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Simular eliminación ya que el backend no cuenta con endpoint para eliminar leads
      return new Promise((resolve) => setTimeout(resolve, 800));
    },
    onSuccess: () => {
      toast.success("Prospecto eliminado exitosamente.");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setLeadToDeleteId(null);
    },
    onError: () => {
      toast.error("Ocurrió un error al intentar eliminar el prospecto.");
    }
  });

  // Query principal de leads para administración
  const { data: serverRes, isLoading, isError } = useQuery({
    queryKey: ["leads", "all"],
    queryFn: () => getAllLeads(),
  });

  // Mapeo simple de datos para admin
  const leads = useMemo(() => {
    const rawData = unpackLeads(serverRes);
    return adaptLeads(rawData);
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
    leadToDeleteId,
    setLeadToDeleteId,
    deleteMutation,
    leads,
    filteredLeads,
    isLoading,
    isError,
    getDateRangeLabel,
    handleQuickSelect,
    handleApplyCustomRange,
    hasActiveFilters,
    handleResetFilters,
  };
};
