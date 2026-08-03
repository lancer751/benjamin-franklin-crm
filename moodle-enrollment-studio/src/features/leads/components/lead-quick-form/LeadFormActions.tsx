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
    <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t bg-background/95 py-4 backdrop-blur sm:flex-row sm:justify-end">
      <Button type="button" variant="outline" onClick={cancel} disabled={isPending}>Cancelar</Button>
      <Button type="submit" disabled={disabled}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? pendingLabel : label}
      </Button>
    </div>
  );
}
