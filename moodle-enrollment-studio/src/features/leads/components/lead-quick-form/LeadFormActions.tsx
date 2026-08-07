import { Loader2 } from "lucide-react";
import { Button } from "@/core/components/ui/button";

interface LeadFormActionsProps {
  cancel: () => void;
  disabled: boolean;
  isPending: boolean;
  label: string;
  pendingLabel: string;
}

export function LeadFormActions({ cancel, disabled, isPending, label, pendingLabel }: LeadFormActionsProps) {
  return (
    <div className="sticky bottom-0 z-30 flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/95 px-0 py-3 shadow-[0_-3px_8px_-8px_rgba(15,23,42,0.45)] backdrop-blur-md">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={cancel}
        disabled={isPending}
        className="h-9 px-4 text-sm font-semibold"
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        size="sm"
        disabled={disabled}
        className="h-9 px-5 text-sm font-bold gap-1.5 shadow-sm"
      >
        {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {isPending ? pendingLabel : label}
      </Button>
    </div>
  );
}
