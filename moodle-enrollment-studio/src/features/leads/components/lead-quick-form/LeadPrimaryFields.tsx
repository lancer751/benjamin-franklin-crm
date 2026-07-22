import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { useFormContext } from "react-hook-form";
import type { LeadFieldsInput } from "../../schemas/leadFieldsSchema";

export function LeadPrimaryFields() {
  const form = useFormContext<LeadFieldsInput>();
  return (
    <section className="space-y-4" aria-labelledby="primary-fields-title">
      <div><h2 id="primary-fields-title" className="text-base font-semibold">Datos principales</h2><p className="text-sm text-muted-foreground">Información esencial para identificar y contactar al prospecto.</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField control={form.control} name="cellphone" render={({ field }) => (
          <FormItem className="sm:col-span-2"><FormLabel>Celular <span className="text-destructive">*</span></FormLabel><FormControl><Input inputMode="numeric" autoComplete="tel" placeholder="987654321" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="first_name" render={({ field }) => (
          <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input autoComplete="given-name" placeholder="Nombre" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="last_name" render={({ field }) => (
          <FormItem><FormLabel>Apellido</FormLabel><FormControl><Input autoComplete="family-name" placeholder="Apellido" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem className="sm:col-span-2"><FormLabel>Correo</FormLabel><FormControl><Input type="email" autoComplete="email" placeholder="correo@ejemplo.com" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </div>
    </section>
  );
}
