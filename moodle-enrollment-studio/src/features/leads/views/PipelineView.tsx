import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MoreVertical, User, Mail, CalendarIcon, ChevronDown, Filter, X } from "lucide-react";
import { format, startOfWeek, startOfMonth, subMonths, subDays, isAfter, isBefore } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/core/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/components/ui/popover";
import { Calendar } from "@/core/components/ui/calendar";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  value: number;
  daysInStage: number;
  campaign?: string;
  seller?: string;
  createdAt?: Date;
}

const pipelineColumns = [
  { id: "NEW", label: "Nuevo", color: "bg-blue-500" },
  { id: "CONTACTED", label: "Contactado", color: "bg-yellow-500" },
  { id: "QUALIFIED", label: "Calificado", color: "bg-purple-500" },
  { id: "NEGOTIATION", label: "Negociación", color: "bg-orange-500" },
  { id: "WON", label: "Ganado", color: "bg-emerald-500" },
  { id: "LOST", label: "Perdido", color: "bg-red-500" },
];

const campaignOptions = ["Summer Enrollment 2024", "B2B Awareness Program", "Gen Z Skills Push", "Remarketing Core", "Influencer Collab"];
const sellerOptions = ["Juan Pérez", "María García", "Carlos Ruiz", "Ana Torres"];

const datePresets = [
  { label: "Hoy", value: "today" },
  { label: "Ayer", value: "yesterday" },
  { label: "Esta semana", value: "this_week" },
  { label: "Este mes", value: "this_month" },
  { label: "Mes pasado", value: "last_month" },
  { label: "Personalizado", value: "custom" },
];

const initialLeads: Record<string, Lead[]> = {
  NEW: [
    { id: "L001", name: "Carlos Mendoza", email: "cmendoza@mail.com", phone: "987654321", course: "Data Science", value: 1250, daysInStage: 1, campaign: "Summer Enrollment 2024", seller: "Juan Pérez", createdAt: new Date() },
    { id: "L002", name: "María López", email: "mlopez@mail.com", phone: "912345678", course: "Marketing Digital", value: 890, daysInStage: 3, campaign: "Influencer Collab", seller: "María García", createdAt: subDays(new Date(), 3) },
    { id: "L003", name: "Pedro Ruiz", email: "pruiz@mail.com", phone: "945678123", course: "Python Avanzado", value: 650, daysInStage: 0, campaign: "Gen Z Skills Push", seller: "Carlos Ruiz", createdAt: new Date() },
  ],
  CONTACTED: [
    { id: "L004", name: "Ana García", email: "agarcia@mail.com", phone: "956789012", course: "UI/UX Bootcamp", value: 1800, daysInStage: 5, campaign: "Remarketing Core", seller: "Ana Torres", createdAt: subDays(new Date(), 5) },
    { id: "L005", name: "Luis Torres", email: "ltorres@mail.com", phone: "967890123", course: "Liderazgo", value: 450, daysInStage: 2, campaign: "B2B Awareness Program", seller: "Juan Pérez", createdAt: subDays(new Date(), 2) },
  ],
  QUALIFIED: [
    { id: "L006", name: "Rosa Díaz", email: "rdiaz@mail.com", phone: "978901234", course: "Ciberseguridad", value: 2100, daysInStage: 4, campaign: "Summer Enrollment 2024", seller: "María García", createdAt: subDays(new Date(), 4) },
    { id: "L007", name: "Jorge Paredes", email: "jparedes@mail.com", phone: "989012345", course: "Data Science", value: 1250, daysInStage: 7, campaign: "Remarketing Core", seller: "Carlos Ruiz", createdAt: subDays(new Date(), 7) },
  ],
  NEGOTIATION: [
    { id: "L008", name: "Elena Vargas", email: "evargas@mail.com", phone: "990123456", course: "Marketing Digital", value: 890, daysInStage: 3, campaign: "Influencer Collab", seller: "Ana Torres", createdAt: subDays(new Date(), 3) },
  ],
  WON: [
    { id: "L009", name: "Roberto Sánchez", email: "rsanchez@mail.com", phone: "901234567", course: "Data Science", value: 1250, daysInStage: 0, campaign: "Summer Enrollment 2024", seller: "Juan Pérez", createdAt: new Date() },
    { id: "L010", name: "Lucía Herrera", email: "lherrera@mail.com", phone: "912345670", course: "Liderazgo", value: 450, daysInStage: 1, campaign: "B2B Awareness Program", seller: "María García", createdAt: subDays(new Date(), 1) },
  ],
  LOST: [
    { id: "L011", name: "Fernando Castro", email: "fcastro@mail.com", phone: "923456701", course: "Python Avanzado", value: 650, daysInStage: 10, campaign: "Gen Z Skills Push", seller: "Carlos Ruiz", createdAt: subDays(new Date(), 10) },
  ],
};

const PipelineView = () => {
  const navigate = useNavigate();
  const [leads] = useState(initialLeads);
  const [draggedLead, setDraggedLead] = useState<{ lead: Lead; fromCol: string } | null>(null);

  // Filters
  const [datePreset, setDatePreset] = useState("all");
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();
  const [filterCampaign, setFilterCampaign] = useState("");
  const [filterSeller, setFilterSeller] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const getDateRange = (): [Date | null, Date | null] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (datePreset) {
      case "today": return [today, now];
      case "yesterday": { const y = subDays(today, 1); return [y, today]; }
      case "this_week": return [startOfWeek(today, { weekStartsOn: 1 }), now];
      case "this_month": return [startOfMonth(today), now];
      case "last_month": { const s = startOfMonth(subMonths(today, 1)); return [s, startOfMonth(today)]; }
      case "custom": return [customFrom || null, customTo || null];
      default: return [null, null];
    }
  };

  const filteredLeads = useMemo(() => {
    const [from, to] = getDateRange();
    const result: Record<string, Lead[]> = {};
    for (const col of pipelineColumns) {
      result[col.id] = (leads[col.id] || []).filter((l) => {
        if (filterCampaign && l.campaign !== filterCampaign) return false;
        if (filterSeller && l.seller !== filterSeller) return false;
        if (from && l.createdAt && isBefore(l.createdAt, from)) return false;
        if (to && l.createdAt && isAfter(l.createdAt, to)) return false;
        return true;
      });
    }
    return result;
  }, [leads, datePreset, customFrom, customTo, filterCampaign, filterSeller]);

  const totalValue = Object.values(filteredLeads).flat().reduce((sum, l) => sum + l.value, 0);
  const totalLeads = Object.values(filteredLeads).flat().length;
  const hasFilters = datePreset !== "all" || filterCampaign || filterSeller;

  const clearFilters = () => {
    setDatePreset("all");
    setCustomFrom(undefined);
    setCustomTo(undefined);
    setFilterCampaign("");
    setFilterSeller("");
  };

  const handleDragStart = (lead: Lead, fromCol: string) => {
    setDraggedLead({ lead, fromCol });
  };

  const handleDrop = (toCol: string) => {
    if (!draggedLead || draggedLead.fromCol === toCol) {
      setDraggedLead(null);
      return;
    }
    setDraggedLead(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline de Ventas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalLeads} leads activos • Valor total: S/ {totalValue.toLocaleString()}
          </p>
        </div>
        <button className="btn-primary"><Plus size={18} /> Nuevo Lead</button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter size={16} className="text-muted-foreground" />

        {/* Date Preset */}
        <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
              <CalendarIcon size={14} className="text-muted-foreground" />
              {datePreset === "all" ? "Fecha" : datePreset === "custom" && customFrom ? `${format(customFrom, "dd/MM")} – ${customTo ? format(customTo, "dd/MM") : "..."}` : datePresets.find(d => d.value === datePreset)?.label || "Fecha"}
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-2 space-y-1 border-b border-border">
              <button onClick={() => { setDatePreset("all"); setShowDatePicker(false); }} className={cn("w-full text-left px-3 py-1.5 rounded text-sm hover:bg-muted transition-colors", datePreset === "all" && "bg-primary/10 text-primary font-semibold")}>
                Todas las fechas
              </button>
              {datePresets.map(p => (
                <button
                  key={p.value}
                  onClick={() => {
                    setDatePreset(p.value);
                    if (p.value !== "custom") setShowDatePicker(false);
                  }}
                  className={cn("w-full text-left px-3 py-1.5 rounded text-sm hover:bg-muted transition-colors", datePreset === p.value && "bg-primary/10 text-primary font-semibold")}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {datePreset === "custom" && (
              <div className="p-3 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Desde</p>
                  <Calendar mode="single" selected={customFrom} onSelect={setCustomFrom} className={cn("p-2 pointer-events-auto")} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Hasta</p>
                  <Calendar mode="single" selected={customTo} onSelect={setCustomTo} className={cn("p-2 pointer-events-auto")} />
                </div>
                <button onClick={() => setShowDatePicker(false)} className="btn-primary w-full text-xs py-2">Aplicar</button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Campaign Filter */}
        <div className="relative">
          <select
            value={filterCampaign}
            onChange={(e) => setFilterCampaign(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-lg border border-border bg-card text-sm text-foreground appearance-none cursor-pointer hover:bg-muted transition-colors"
          >
            <option value="">Campaña</option>
            {campaignOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        {/* Seller Filter */}
        <div className="relative">
          <select
            value={filterSeller}
            onChange={(e) => setFilterSeller(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-lg border border-border bg-card text-sm text-foreground appearance-none cursor-pointer hover:bg-muted transition-colors"
          >
            <option value="">Vendedor</option>
            {sellerOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 h-9 px-3 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <X size={14} /> Limpiar
          </button>
        )}
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {pipelineColumns.map((col) => {
          const colLeads = filteredLeads[col.id] || [];
          const colValue = colLeads.reduce((s, l) => s + l.value, 0);
          return (
            <div
              key={col.id}
              className="flex-shrink-0 w-[260px] rounded-xl bg-muted/50 border border-border"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                  <span className="text-sm font-bold text-foreground">{col.label}</span>
                  <span className="bg-muted rounded-full px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{colLeads.length}</span>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">S/ {colValue.toLocaleString()}</span>
              </div>

              <div className="p-3 space-y-3 min-h-[200px]">
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead, col.id)}
                    onClick={() => navigate(`/prospectos/${lead.id}`)}
                    className="rounded-lg bg-card border border-border p-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User size={14} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{lead.name}</p>
                          <p className="text-[10px] text-muted-foreground">{lead.id}</p>
                        </div>
                      </div>
                      <button className="text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{lead.course}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Mail size={10} /> {lead.email}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-sm font-bold text-primary">S/ {lead.value.toLocaleString()}</span>
                      <span className="text-[10px] text-muted-foreground">{lead.daysInStage}d en etapa</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineView;
