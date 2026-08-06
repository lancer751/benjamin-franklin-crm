import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { useFormContext } from "react-hook-form";
import type { LeadFieldsInput } from "../../schemas/leadFieldsSchema";

export function LeadPrimaryFields() {
  const form = useFormContext<LeadFieldsInput>();
  return (
    <section className="space-y-3" aria-labelledby="primary-fields-title">
      <div className="border-b border-slate-100 pb-2">
        <h2 id="primary-fields-title" className="text-base font-bold text-slate-900">
          Datos principales
        </h2>
        <p className="text-sm text-slate-500">Información esencial para identificar y contactar al prospecto.</p>
      </div>

      {/* Grid: Fila 1 (Celular, Nombre, Apellido) / Fila 2 (Correo) */}
      <div className="grid gap-3 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="cellphone"
          render={({ field }) => (
            <FormItem className="sm:col-span-1">
              <FormLabel className="text-sm font-semibold">
                Celular <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  className="h-9 text-sm"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="987654321"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem className="sm:col-span-1">
              <FormLabel className="text-sm font-semibold">Nombre</FormLabel>
              <FormControl>
                <Input
                  className="h-9 text-sm"
                  autoComplete="given-name"
                  placeholder="Nombre"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem className="sm:col-span-1">
              <FormLabel className="text-sm font-semibold">Apellido</FormLabel>
              <FormControl>
                <Input
                  className="h-9 text-sm"
                  autoComplete="family-name"
                  placeholder="Apellido"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="sm:col-span-3">
              <FormLabel className="text-sm font-semibold">Correo electrónico</FormLabel>
              <FormControl>
                <Input
                  className="h-9 text-sm"
                  type="email"
                  autoComplete="email"
                  placeholder="correo@ejemplo.com"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />
      </div>
    </section>
  );
}
