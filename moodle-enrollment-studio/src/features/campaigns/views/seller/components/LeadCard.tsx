import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Phone, Mail, Calendar, Edit, MessageSquare } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { FUNNEL_COLUMNS, ENUM_TO_KANBAN_STAGE } from "../SellerLeadsView";

interface LeadCardProps {
  lead: any;
  onSelect: (lead: any) => void;
  onStatusChange: (memberId: string, newStatus: string) => void;
  isPending: boolean;
}

export default function LeadCard({ lead, onSelect, onStatusChange, isPending }: LeadCardProps) {
  const navigate = useNavigate();

  const getPhone = (l: any) => {
    if (l.cellphone) return l.cellphone;
    if (l.phone) return l.phone;
    if (l.phones?.[0]?.number) return l.phones[0].number;
    return null;
  };

  const formatSafeDate = (dateStr: string | null | undefined, pattern = "dd/MM/yy HH:mm") => {
    if (!dateStr) return "-";
    try {
      return format(new Date(dateStr), pattern);
    } catch (e) {
      return dateStr;
    }
  };

  const phone = getPhone(lead);
  const formattedPhone = phone ? phone.replace(/\D/g, "") : "";
  const whatsappUrl = formattedPhone ? `https://wa.me/${formattedPhone}` : "";
  const displayDate = formatSafeDate(lead.created_at, "dd/MM/yy HH:mm");
  const memberId = lead.campaignsEngaging?.[0]?.id || lead.id || "";

  return (
    <div
      onClick={() => onSelect(lead)}
      className="bg-card border border-border rounded-xl p-3.5 shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-200 group relative space-y-3 cursor-pointer"
    >
      {/* Top Lead Info */}
      <div className="space-y-1">
        <h4 className="font-bold text-foreground text-xs leading-snug group-hover:text-primary transition-colors">
          {lead.first_name} {lead.last_name}
        </h4>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Calendar size={11} /> {displayDate}
        </p>
      </div>

      {/* Contact Details */}
      <div className="space-y-1 text-[10px] text-muted-foreground pt-1 border-t border-border/40">
        {phone && (
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            <Phone size={10} className="text-muted-foreground/80" /> {phone}
          </p>
        )}
        {lead.email && (
          <p className="flex items-center gap-1.5 truncate" title={lead.email}>
            <Mail size={10} className="text-muted-foreground/80" /> {lead.email}
          </p>
        )}
      </div>

      {/* Action Bar / Dropdown to change stage */}
      <div 
        className="pt-2 border-t border-border/40 flex items-center justify-between gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full">
          <select
            value={ENUM_TO_KANBAN_STAGE[lead.lead_status] || lead.lead_status || "NUEVO"}
            onChange={(e) => onStatusChange(memberId, e.target.value)}
            className="w-full h-7 px-1.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-primary/20 cursor-pointer shadow-sm"
            disabled={isPending}
          >
            {FUNNEL_COLUMNS.map((s) => (
              <option key={s.id} value={s.id}>
                Mover a: {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick External Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-7 w-7 rounded-lg border border-border hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-muted-foreground hover:text-emerald-600 flex items-center justify-center transition-all shadow-sm"
              title="Enviar WhatsApp"
            >
              <MessageSquare size={13} />
            </a>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/prospectos/${lead.id}/editar`)}
            className="h-7 w-7 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all shadow-sm"
            title="Editar Prospecto"
          >
            <Edit size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
}
