import { useController, type Control } from "react-hook-form";
import { Label } from "@/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import type { AdvisorFilterOption } from "@/features/leads/adapters/campaignAssignmentAdapter";
import type { OrderFormValues } from "../types";

export function OrderAssigneeSection({
  control,
  options,
  isLoading,
}: {
  control: Control<OrderFormValues>;
  options: AdvisorFilterOption[];
  isLoading?: boolean;
}) {
  const { field } = useController({ control, name: "assigned_to" });

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Asesor responsable</h2>
        <p className="text-sm text-muted-foreground">
          La API recibe el identificador de usuario del asesor, no el del perfil de vendedor.
        </p>
      </div>
      <div className="max-w-sm space-y-2">
        <Label htmlFor="order-assignee">Asignado a</Label>
        <Select
          value={field.value || undefined}
          onValueChange={field.onChange}
          disabled={isLoading || options.length === 0}
        >
          <SelectTrigger id="order-assignee">
            <SelectValue placeholder={isLoading ? "Cargando asesores..." : "Seleccionar asesor"} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.userId} value={option.userId}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!isLoading && options.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay asesores activos disponibles para reasignar la orden.
          </p>
        )}
      </div>
    </section>
  );
}
