import { AlertTriangle } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Card } from "@/core/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import type { LeadFieldsInput } from "../../schemas/leadFieldsSchema";
import { LEAD_STATUS_OPTIONS } from "../../utils/prospectDisplay";

const selectClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function LeadStatusField() {
  const form = useFormContext<LeadFieldsInput>();

  return (
    <Card className="space-y-4 p-5 shadow-sm sm:p-6">
      <section className="space-y-4" aria-labelledby="lead-status-title">
        <div>
          <h2 id="lead-status-title" className="text-base font-semibold">Estado del prospecto</h2>
          <p className="text-sm text-muted-foreground">Controla si participa en la gestión operativa.</p>
        </div>
        <FormField
          control={form.control}
          name="lead_status"
          render={({ field }) => (
            <FormItem className="max-w-md">
              <FormLabel>Estado general</FormLabel>
              <FormControl>
                <select className={selectClass} value={field.value} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref}>
                  {LEAD_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </FormControl>
              <FormDescription>
                Activo: el prospecto puede continuar en los procesos comerciales.<br />
                Inactivo: se conserva su historial, pero deja de participar en la gestión operativa.
              </FormDescription>
              {field.value === "INACTIVE" && (
                <p className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="status">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Al guardar, este prospecto dejará de aparecer en los flujos operativos activos. Su información e historial se conservarán.</span>
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </section>
    </Card>
  );
}
