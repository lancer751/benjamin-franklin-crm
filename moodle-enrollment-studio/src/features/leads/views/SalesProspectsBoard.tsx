import { useState, useMemo, useRef, useEffect } from "react";
import { Plus, Loader2, Users, Eye, Edit, Calendar, ChevronDown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { getCampaignMembers } from "../services/leadService";
import { getCampaigns } from "@/features/marketing/services/campaignService";
import { useAuthStore } from "@/store/useAuthStore";
import { CustomTable } from "@/core/components/CustomTable";
import { Card } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/core/components/ui/badge";
import { useSearchStore } from "@/store/useSearchStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";

// 🌟 Mapeo de colores adaptado a las tipificaciones reales del Excel de los vendedores
const stageColors: Record<string, string> = {
  ACTIVE: "bg-blue-50 text-blue-600 border-blue-100/50",
  INACTIVE: "bg-slate-50 text-slate-500 border-slate-100/50",
  stage_Muy_interesado: "bg-purple-50 text-purple-600 border-purple-100/50",
  stage_Volver_a_llamar: "bg-yellow-50 text-yellow-600 border-yellow-100/50",
  stage_No_contesta: "bg-orange-50 text-orange-600 border-orange-100/50",
  stage_No_interesado: "bg-red-50 text-red-600 border-red-100/50",
};

export const SalesProspectsBoard = () => {
  // 🌟 Estados de Filtros
  const [tipificationFilter, setTipificationFilter] = useState("ALL");
  const [genderFilter, setGenderFilter] = useState("ALL");

  // Rango de fechas avanzado
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [dateRangeType, setDateRangeType] = useState<"ALL" | "TODAY" | "YESTERDAY" | "LAST_7_DAYS" | "THIS_MONTH" | "CUSTOM">("ALL");
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

  const navigate = useNavigate();

  const { user } = useAuthStore();
  const sellerId = user?.id;

  // 1. Consultar y recopilar las campañas disponibles
  const { data: campaignsRes, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ["campaigns-list"],
    queryFn: () => getCampaigns(),
  });
  const campaigns = campaignsRes?.data?.data || [];
  const activeCampaigns = campaigns.filter((c: any) => c.status === "ACTIVE");

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
  const isLoading = isLoadingLeads;

  // Aplanamiento de datos
  const leads = useMemo(() => {
    const rawData = serverRes?.data?.data || serverRes?.data || [];
    if (!Array.isArray(rawData)) return [];
    return rawData.map((member: any) => ({
      ...member.lead,
      id: member.lead_id,
      lead_status: member.status,
      created_at: member.created_at
    }));
  }, [serverRes]);

  // Lógica de Filtrado Avanzada
  const filteredLeads = useMemo(() => {
    if (!Array.isArray(leads)) return [];
    let startLimit: number | null = null;
    let endLimit: number | null = null;
    const now = new Date();

    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
    const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();

    if (dateRangeType === "TODAY") {
      startLimit = startOfDay(now);
      endLimit = endOfDay(now);
    } else if (dateRangeType === "YESTERDAY") {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      startLimit = startOfDay(yesterday);
      endLimit = endOfDay(yesterday);
    } else if (dateRangeType === "LAST_7_DAYS") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 6);
      startLimit = startOfDay(sevenDaysAgo);
      endLimit = endOfDay(now);
    } else if (dateRangeType === "THIS_MONTH") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      startLimit = startOfDay(firstDay);
      endLimit = endOfDay(now);
    } else if (dateRangeType === "CUSTOM") {
      if (customStartDate) {
        const parts = customStartDate.split("-");
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        startLimit = startOfDay(d);
      }
      if (customEndDate) {
        const parts = customEndDate.split("-");
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        endLimit = endOfDay(d);
      }
    }

    const query = searchQuery.trim().toLowerCase();

    return leads.filter((lead: any) => {
      const matchTipification = tipificationFilter === "ALL" || lead.lead_status === tipificationFilter;
      const matchGender = genderFilter === "ALL" || lead.gender === genderFilter;
      
      let matchDate = true;
      if (dateRangeType !== "ALL" && lead.created_at) {
        const leadTime = new Date(lead.created_at).getTime();
        if (!isNaN(leadTime)) {
          if (startLimit !== null && leadTime < startLimit) matchDate = false;
          if (endLimit !== null && leadTime > endLimit) matchDate = false;
        } else {
          matchDate = false;
        }
      }

      let matchSearch = true;
      if (query) {
        const firstName = lead.first_name?.toLowerCase() || "";
        const middleName = lead.middle_name?.toLowerCase() || "";
        const lastName = lead.last_name?.toLowerCase() || "";
        const email = lead.email?.toLowerCase() || "";
        const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ');

        matchSearch = (
          firstName.includes(query) ||
          middleName.includes(query) ||
          lastName.includes(query) ||
          fullName.includes(query) ||
          email.includes(query)
        );
      }

      return matchTipification && matchGender && matchDate && matchSearch;
    });
  }, [leads, tipificationFilter, genderFilter, dateRangeType, customStartDate, customEndDate, searchQuery]);

  // Definición de columnas
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "Fecha de Registro",
        accessorKey: "created_at",
        cell: ({ row }) => {
          const dateVal = row.original.created_at;
          if (!dateVal) return <span className="text-muted-foreground/60 text-xs">-</span>;
          try {
            return (
              <span className="text-foreground">
                {format(new Date(dateVal), "dd/MM/yyyy HH:mm")}
              </span>
            );
          } catch (error) {
            return <span className="text-muted-foreground/60 text-xs">-</span>;
          }
        },
      },
      {
        header: "Nombre Completo",
        accessorKey: "first_name",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                {p.first_name?.[0] || ""}{p.last_name?.[0] || ""}
              </div>
              <span className="font-medium text-foreground">
                {p.first_name} {p.middle_name ? `${p.middle_name} ` : ""}{p.last_name}
              </span>
            </div>
          );
        },
      },
      {
        header: "Contacto",
        accessorKey: "email",
        cell: ({ row }) => <span className="text-foreground">{row.original.email}</span>,
      },
      {
        header: "Celular",
        accessorKey: "cellphone",
        cell: ({ row }) => {
          const phone = row.original.phones?.[0]?.number;
          return phone ? (
            <span className="text-foreground">{phone}</span>
          ) : (
            <Badge variant="secondary" className="bg-slate-50 text-slate-400 border-slate-150 hover:bg-slate-100/50 font-medium text-[11px]">
              Sin número
            </Badge>
          );
        },
      },
      {
        header: "Etapa / Tipificación",
        accessorKey: "lead_status",
        cell: ({ row }) => {
          const status = row.original.lead_status || "ACTIVE";
          const labelDisplay = status === "ACTIVE" ? "Activo / Nuevo" : status === "INACTIVE" ? "Inactivo" : status;
          return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${stageColors[status] || "bg-slate-50 text-slate-500 border-slate-100/50"}`}>
              {labelDisplay}
            </span>
          );
        },
      },
      {
        header: "Acciones",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/prospectos/${p.id}`);
                }}
                title="Ver Detalle"
              >
                <Eye size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/prospectos/${p.id}/editar`);
                }}
                title="Editar"
              >
                <Edit size={16} />
              </Button>
            </div>
          );
        },
      },
    ],
    [navigate]
  );

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

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Prospectos</h1>
          <p className="text-sm text-muted-foreground mt-1">Administra y da seguimiento a los leads de inscripción de la Corporación.</p>
        </div>
        <Button onClick={() => navigate("/prospectos/nuevo")} className="flex items-center gap-2 shadow-sm rounded-lg">
          <Plus size={16} /> Nuevo Prospecto
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row items-end gap-3 rounded-xl bg-white p-4 border border-slate-100 shadow-sm">
        
        {/* Fecha de Registro */}
        <div className="w-full md:flex-1 relative" ref={popoverRef}>
          <label className="form-label flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <Calendar size={13} className="text-primary/70" /> Fecha de Registro
          </label>
          
          <button
            type="button"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className="flex items-center justify-between w-full h-9 px-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 hover:border-slate-350 text-xs md:text-sm text-slate-700 font-medium transition-all shadow-sm focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <span>{getDateRangeLabel()}</span>
            </div>
            <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isPopoverOpen ? "rotate-180" : ""}`} />
          </button>

          {isPopoverOpen && (
            <div className="absolute left-0 mt-2 w-64 rounded-xl border border-slate-100 bg-white p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="space-y-1 mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                  Accesos rápidos
                </span>
                <button
                  type="button"
                  onClick={() => handleQuickSelect("ALL")}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    dateRangeType === "ALL"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  Cualquier fecha
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect("TODAY")}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    dateRangeType === "TODAY"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect("YESTERDAY")}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    dateRangeType === "YESTERDAY"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  Ayer
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect("LAST_7_DAYS")}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    dateRangeType === "LAST_7_DAYS"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  Últimos 7 días
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSelect("THIS_MONTH")}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    dateRangeType === "THIS_MONTH"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  Este mes
                </button>
              </div>
              
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                  Rango personalizado
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Inicio</label>
                    <input
                      type="date"
                      value={tempStartDate}
                      onChange={(e) => setTempStartDate(e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-slate-200 bg-slate-50/50 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-medium block mb-1">Fin</label>
                    <input
                      type="date"
                      value={tempEndDate}
                      onChange={(e) => setTempEndDate(e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-slate-200 bg-slate-50/50 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 cursor-pointer"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleApplyCustomRange}
                  className="w-full h-8 bg-primary hover:bg-primary/95 text-primary-foreground font-medium text-xs rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  Aplicar Rango
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selector de Campaña Activa */}
        <div className="w-full md:flex-1">
          <label className="form-label mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Campaña Activa
          </label>
          <Select
            value={selectedCampaignId}
            onValueChange={setSelectedCampaignId}
          >
            <SelectTrigger className="w-full h-9 bg-white text-xs md:text-sm text-slate-700 focus:ring-primary/10 border-slate-200/80 rounded-lg shadow-sm">
              <SelectValue placeholder="Seleccionar campaña" />
            </SelectTrigger>
            <SelectContent>
              {isLoadingCampaigns ? (
                <SelectItem value="loading" disabled>
                  Cargando campañas...
                </SelectItem>
              ) : activeCampaigns.length === 0 ? (
                <SelectItem value="empty" disabled>
                  Sin campañas asignadas
                </SelectItem>
              ) : (
                activeCampaigns.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.campaing_name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Tipificación (Estado) */}
        <div className="w-full md:flex-1">
          <label className="form-label mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Tipificación (Estado)
          </label>
          <select 
            className="w-full h-9 px-3 rounded-lg border border-slate-200/80 bg-white text-xs md:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer shadow-sm" 
            value={tipificationFilter} 
            onChange={(e) => setTipificationFilter(e.target.value)}
          >
            <option value="ALL">Cualquier Estado</option>
            <option value="ACTIVE">Activo / Nuevo</option>
            <option value="INACTIVE">Inactivo</option>
            <option value="Muy interesado">Muy interesado</option>
            <option value="Volver a llamar">Volver a llamar</option>
            <option value="No contesta">No contesta</option>
            <option value="No interesado">No interesado</option>
          </select>
        </div>

        {/* Género */}
        <div className="w-full md:flex-1">
          <label className="form-label mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Género
          </label>
          <select 
            className="w-full h-9 px-3 rounded-lg border border-slate-200/80 bg-white text-xs md:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer shadow-sm"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="ALL">Todos los Géneros</option>
            <option value="MALE">Masculino</option>
            <option value="FEMALE">Femenino</option>
            <option value="NOT_SPECIFIED">No especificado</option>
          </select>
        </div>

        {/* Limpiar Filtros */}
        {hasActiveFilters && (
          <button 
            type="button"
            className="w-full md:w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-500 transition-all shrink-0 cursor-pointer shadow-sm"
            onClick={handleResetFilters}
            title="Limpiar filtros"
          >
            <X size={15} />
            <span className="md:hidden ml-2 text-xs font-medium">Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Table Section */}
      <Card className="shadow-sm border-border/60 overflow-hidden flex flex-col p-6 bg-white rounded-xl">
        {isLoading ? (
           <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
             <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
             <p>Cargando prospectos...</p>
           </div>
        ) : isError ? (
           <div className="flex flex-col items-center justify-center py-20 text-destructive">
             <p className="font-bold">Error al conectar con el servidor.</p>
           </div>
        ) : !Array.isArray(leads) || leads.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
             <Users className="h-12 w-12 mb-4 opacity-20" />
             <p>No hay prospectos registrados aún en esta campaña.</p>
           </div>
        ) : filteredLeads.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
             <Users className="h-12 w-12 mb-4 opacity-20" />
             <p>No se encontraron prospectos con los filtros seleccionados.</p>
           </div>
        ) : (
          <CustomTable data={filteredLeads} columns={columns} />
        )}
      </Card>
    </div>
  );
};
