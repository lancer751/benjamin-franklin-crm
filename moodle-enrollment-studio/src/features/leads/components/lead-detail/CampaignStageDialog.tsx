import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  CAMPAIGN_MEMBER_STATUS_OPTIONS,
  getCampaignMemberStatusLabel,
  isCampaignMemberStatus,
  type CampaignMemberStatus,
} from "@/core/constants/campaignMemberStatus";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";
import { Label } from "@/core/components/ui/label";
import type { LeadCampaignViewModel } from "../../adapters/leadDetailAdapter";

interface CampaignStageDialogProps {
  member: LeadCampaignViewModel | null;
  open: boolean;
  isPending: boolean;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (status: CampaignMemberStatus) => void;
}

export function CampaignStageDialog({ member, open, isPending, error, onOpenChange, onSubmit }: CampaignStageDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<CampaignMemberStatus | "">("");

  useEffect(() => {
    if (open && member) setSelectedStatus(member.status);
  }, [member, open]);

  const hasChange = Boolean(member && selectedStatus && selectedStatus !== member.status);
  const isLost = selectedStatus === "PERDIDO";
  const isEnrolled = selectedStatus === "MATRICULADO";
  const handleOpenChange = (nextOpen: boolean) => {
    if (!isPending) onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-h-[90vh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg"
        onEscapeKeyDown={(event) => { if (isPending) event.preventDefault(); }}
        onInteractOutside={(event) => { if (isPending) event.preventDefault(); }}
      >
        <DialogHeader>
          <DialogTitle>Cambiar etapa comercial</DialogTitle>
          <DialogDescription>El cambio se aplicará únicamente a esta campaña.</DialogDescription>
        </DialogHeader>
        {member && (
          <div className="space-y-5 py-2">
            <dl className="grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
              <div><dt className="text-sm text-muted-foreground">Campaña</dt><dd className="mt-1 font-medium">{member.campaignName}</dd></div>
              <div><dt className="text-sm text-muted-foreground">Etapa actual</dt><dd className="mt-1 font-medium">{getCampaignMemberStatusLabel(member.status)}</dd></div>
            </dl>
            <div className="space-y-2">
              <Label htmlFor="campaign-stage">Nueva etapa</Label>
              <select
                id="campaign-stage"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={selectedStatus}
                disabled={isPending}
                onChange={(event) => {
                  if (isCampaignMemberStatus(event.target.value)) setSelectedStatus(event.target.value);
                }}
              >
                {CAMPAIGN_MEMBER_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            {isEnrolled && selectedStatus !== member.status && (
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Al marcar esta etapa como “Matriculado”, el prospecto quedará habilitado para procesos posteriores como la generación de órdenes.</AlertDescription>
              </Alert>
            )}
            {isLost && selectedStatus !== member.status && (
              <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>Al marcar esta etapa como “Perdido”, el prospecto dejará de continuar en el flujo comercial de esta campaña. Su historial se conservará.</AlertDescription>
              </Alert>
            )}
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          </div>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>Cancelar</Button>
          <Button type="button" disabled={!hasChange || isPending} onClick={() => { if (selectedStatus) onSubmit(selectedStatus); }}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Guardando..." : isLost ? "Confirmar y guardar" : "Guardar cambio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
