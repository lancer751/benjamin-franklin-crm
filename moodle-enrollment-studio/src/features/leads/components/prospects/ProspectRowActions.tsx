import { Edit3, Eye } from "lucide-react";
import { Button } from "@/core/components/ui/button";

interface ProspectRowActionsProps {
  prospectId: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

export function ProspectRowActions({ prospectId, onView, onEdit }: ProspectRowActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={() => onView(prospectId)}
        aria-label="Ver prospecto"
      >
        <Eye className="h-4 w-4" aria-hidden="true" />
        Ver
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5"
        onClick={() => onEdit(prospectId)}
        aria-label="Editar prospecto"
      >
        <Edit3 className="h-4 w-4" aria-hidden="true" />
        Editar
      </Button>
    </div>
  );
}
