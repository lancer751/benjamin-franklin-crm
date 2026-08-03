import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { User } from "lucide-react";
import { LeadFormValues } from "../../schemas/leadFormSchema";

interface PersonalInfoCardProps {
  form: UseFormReturn<LeadFormValues>;
}

export default function PersonalInfoCard({ form }: PersonalInfoCardProps) {
  return (
    <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Encabezado de la Sección */}
      <div className="flex items-center gap-3 border-b border-border/60 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <User className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Información Personal</h3>
          <p className="text-xs text-muted-foreground">Datos de identidad básicos del prospecto</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombres <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Ej: Juan Pablo" className="rounded-xl" {...field} />
              </FormControl>
              <FormMessage className="text-red-500 text-xs mt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="middle_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apellido Paterno <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Ej: Pérez" className="rounded-xl" {...field} />
              </FormControl>
              <FormMessage className="text-red-500 text-xs mt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Apellido Materno <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Ej: Gómez" className="rounded-xl" {...field} />
              </FormControl>
              <FormMessage className="text-red-500 text-xs mt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dni"
          render={({ field }) => (
            <FormItem>
              <FormLabel>DNI</FormLabel>
              <FormControl>
                <Input placeholder="8 dígitos" maxLength={8} className="rounded-xl font-mono" {...field} />
              </FormControl>
              <FormMessage className="text-red-500 text-xs mt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Género</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  <SelectItem value="MALE">Masculino</SelectItem>
                  <SelectItem value="FEMALE">Femenino</SelectItem>
                  <SelectItem value="NOT_SPECIFIED">Prefiero no decirlo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-red-500 text-xs mt-1" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
