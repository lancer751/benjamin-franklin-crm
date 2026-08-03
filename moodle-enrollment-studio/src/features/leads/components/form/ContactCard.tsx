import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { PhoneCall } from "lucide-react";
import { LeadFormValues } from "../../schemas/leadFormSchema";

interface ContactCardProps {
  form: UseFormReturn<LeadFormValues>;
}

export default function ContactCard({ form }: ContactCardProps) {
  return (
    <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Encabezado de la Sección */}
      <div className="flex items-center gap-3 border-b border-border/60 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <PhoneCall className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Contacto y Ubicación</h3>
          <p className="text-xs text-muted-foreground">Datos para comunicación y localización geográfica</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Principal <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input type="email" placeholder="ejemplo@correo.com" className="rounded-xl max-w-md" {...field} />
              </FormControl>
              <FormMessage className="text-red-500 text-xs mt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="secondary_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Secundario</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Opcional" className="rounded-xl max-w-md" {...field} />
              </FormControl>
              <FormMessage className="text-red-500 text-xs mt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono Principal <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Ej: 987654321" className="rounded-xl max-w-md" {...field} />
              </FormControl>
              <FormMessage className="text-red-500 text-xs mt-1" />
            </FormItem>
          )}
        />

        <div className="hidden md:block"></div> {/* Espacio vacío para balancear el grid */}

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="col-span-1 md:col-span-2">
              <FormLabel>Dirección 1</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Av. Principal 123" className="rounded-xl" {...field} />
              </FormControl>
              <FormMessage className="text-red-500 text-xs mt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="second_address"
          render={({ field }) => (
            <FormItem className="col-span-1 md:col-span-2">
              <FormLabel>Dirección 2</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Dpto 401, Residencial San Martín" className="rounded-xl" {...field} />
              </FormControl>
              <FormMessage className="text-red-500 text-xs mt-1" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
