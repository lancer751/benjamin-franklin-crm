import { Clipboard, Edit3, Mail, Megaphone, MessageCircle, MoreHorizontal, Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Card } from "@/core/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/core/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/core/components/ui/tooltip";
import { cn } from "@/core/lib/utils";
import type { LeadCampaignViewModel, LeadDetailViewModel } from "../../adapters/leadDetailAdapter";
import { getLeadStatusLabel } from "../../utils/prospectDisplay";
import type { LeadDetailCapabilities } from "./leadDetail.capabilities";
import { initialsFor, isValidPhone, personFullName } from "./leadDetail.formatters";

interface Props {
  lead: LeadDetailViewModel;
  activeCampaign: LeadCampaignViewModel | null;
  phone?: string | null;
  capabilities: LeadDetailCapabilities;
  onEdit: () => void;
  onAddCampaign: () => void;
  onDelete: () => void;
}

export function LeadDetailHeader({ lead, activeCampaign, phone, capabilities, onEdit, onAddCampaign, onDelete }: Props) {
  const name = personFullName(lead) || "Prospecto sin nombre";
  const callablePhone = isValidPhone(phone) ? phone!.replace(/[^\d+]/g, "") : "";
  const hasEmail = Boolean(lead.email?.trim());
  const noPhoneMessage = "El prospecto no tiene un celular registrado.";

  const copyPhone = async () => {
    if (!callablePhone) return;
    try {
      await navigator.clipboard.writeText(callablePhone);
      toast.success("Celular copiado correctamente.");
    } catch {
      toast.error("No fue posible copiar el celular. Inténtalo nuevamente.");
    }
  };

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">{initialsFor(lead)}</div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-2xl font-bold">{name}</h1>
              <Badge
                variant="outline"
                className={cn(
                  lead.lead_status === "ACTIVE"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-100 text-slate-600",
                )}
              >
                {getLeadStatusLabel(lead.lead_status)}
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {phone && <a className="flex items-center gap-1 hover:text-foreground" href={callablePhone ? `tel:${callablePhone}` : undefined}><Phone className="h-4 w-4" />{phone}</a>}
              {lead.email && <a className="flex items-center gap-1 hover:text-foreground" href={`mailto:${lead.email}`}><Mail className="h-4 w-4" />{lead.email}</a>}
              <span>Asesor asignado: {activeCampaign?.assignedUser?.name ?? "Sin asignar"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          {capabilities.canEditLead && <Button variant="outline" className="gap-2" onClick={onEdit}><Edit3 className="h-4 w-4" />Editar</Button>}
          {callablePhone ? (
            <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600 disabled:bg-emerald-300">
              <a href={`https://wa.me/${callablePhone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"><MessageCircle className="mr-2 h-4 w-4" />WhatsApp</a>
            </Button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex" tabIndex={0}>
                  <Button disabled aria-label={`WhatsApp. ${noPhoneMessage}`} className="bg-emerald-600 text-white"><MessageCircle className="mr-2 h-4 w-4" />WhatsApp</Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{noPhoneMessage}</TooltipContent>
            </Tooltip>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline" className="gap-2"><MoreHorizontal className="h-4 w-4" />Más acciones</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {callablePhone
                ? <DropdownMenuItem asChild><a href={`tel:${callablePhone}`}><Phone className="mr-2 h-4 w-4" />Llamar</a></DropdownMenuItem>
                : <DropdownMenuItem disabled aria-label={`Llamar. ${noPhoneMessage}`}><Phone className="mr-2 h-4 w-4" />Llamar</DropdownMenuItem>}
              <DropdownMenuItem disabled={!callablePhone} aria-label={!callablePhone ? `Copiar celular. ${noPhoneMessage}` : undefined} onSelect={() => void copyPhone()}><Clipboard className="mr-2 h-4 w-4" />Copiar celular</DropdownMenuItem>
              {hasEmail
                ? <DropdownMenuItem asChild><a href={`mailto:${lead.email}`}><Mail className="mr-2 h-4 w-4" />Enviar correo</a></DropdownMenuItem>
                : <DropdownMenuItem disabled><Mail className="mr-2 h-4 w-4" />Enviar correo</DropdownMenuItem>}
              {capabilities.canAddCampaign && <DropdownMenuItem onSelect={onAddCampaign}><Megaphone className="mr-2 h-4 w-4" />Agregar a campaña</DropdownMenuItem>}
              {capabilities.canDeleteLead && <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={onDelete}><Trash2 className="mr-2 h-4 w-4" />Eliminar prospecto</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
