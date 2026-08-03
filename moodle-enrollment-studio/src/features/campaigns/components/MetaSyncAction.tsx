import { useMemo, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/core/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import { formatToLocalTime } from "@/core/utils/date-utils";
import { useSyncMetaLeads } from "../hooks/useSyncMetaLeads";
import {
  getMetaSyncAvailability,
  type MetaSyncCampaign,
} from "../utils/metaSyncAvailability";

interface MetaSyncActionProps {
  campaign: MetaSyncCampaign & {
    id: string;
    leads_last_synced_at?: string | Date | null;
  };
}

const formatLastSync = (value: string | Date) =>
  formatToLocalTime(value).toLocaleString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const MetaSyncAction = ({ campaign }: MetaSyncActionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const availability = useMemo(
    () => getMetaSyncAvailability(campaign),
    [campaign],
  );
  const syncMutation = useSyncMetaLeads(campaign.id, () =>
    setIsDialogOpen(false),
  );
  const isDisabled = !availability.allowed || syncMutation.isPending;

  return (
    <>
      <div className="flex flex-col items-start gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl bg-white font-bold text-slate-700 shadow-sm"
                  disabled={isDisabled}
                  onClick={() => setIsDialogOpen(true)}
                >
                  {syncMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <RefreshCw />
                  )}
                  {syncMutation.isPending
                    ? "Sincronizando…"
                    : "Sincronizar leads"}
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              {availability.missingRequirements.length > 0 ? (
                <ul className="list-disc space-y-1 pl-4">
                  {availability.missingRequirements.map((requirement) => (
                    <li key={requirement}>{requirement}</li>
                  ))}
                </ul>
              ) : (
                <p>Importa manualmente los leads pendientes del formulario vinculado.</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {campaign.leads_last_synced_at && (
          <span className="pl-1 text-[11px] text-muted-foreground">
            Última sincronización: {formatLastSync(campaign.leads_last_synced_at)}
          </span>
        )}
      </div>

      <AlertDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!syncMutation.isPending) setIsDialogOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sincronizar leads de Meta</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Se consultarán los registros del formulario vinculado y se
                importarán los leads que todavía no hayan sido procesados.
              </span>
              <span className="block font-medium text-foreground">
                Los leads existentes no se duplicarán.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={syncMutation.isPending}
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={syncMutation.isPending}
              onClick={() => syncMutation.mutate()}
            >
              {syncMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Sincronizando…
                </>
              ) : (
                "Sincronizar"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
