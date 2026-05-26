import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { Target, Loader2 } from "lucide-react";
import { LeadFormValues } from "../../schemas/leadFormSchema";

interface OriginCardProps {
  form: UseFormReturn<LeadFormValues>;
  isLoadingCampaigns: boolean;
  activeCampaigns: any[];
}

export default function OriginCard({ form, isLoadingCampaigns, activeCampaigns }: OriginCardProps) {
  const watchSource = form.watch("source");

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-6">
      {/* Encabezado de la Sección */}
      <div className="flex items-center gap-3 border-b border-border/60 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Target className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Clasificación y Origen</h3>
          <p className="text-xs text-muted-foreground">Origen del prospecto, campaña asignada y clasificación del CRM</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField
          control={form.control}
          name="profession"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profesión</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Ingeniero, Docente" className="rounded-xl" {...field} />
              </FormControl>
              <FormMessage className="text-red-500 text-xs mt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="primary_campaign_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Campaña de Origen
                {isLoadingCampaigns && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className="rounded-xl" disabled={isLoadingCampaigns}>
                    <SelectValue placeholder="Selecciona campaña" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  <SelectItem value="none">Sin campaña</SelectItem>
                  {activeCampaigns.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.campaing_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-red-500 text-xs mt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Origen del Lead</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Origen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  <SelectItem value="MANUAL">Manual / Presencial</SelectItem>
                  <SelectItem value="FACEBOOK">Facebook</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="WEBSITE">Website</SelectItem>
                  <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                  <SelectItem value="TIKTOK">TikTok</SelectItem>
                  <SelectItem value="REFERRAL">Referido</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-red-500 text-xs mt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lead_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado del Lead</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="INACTIVE">Inactivo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-red-500 text-xs mt-1" />
            </FormItem>
          )}
        />

        {watchSource !== "MANUAL" && (
          <FormField
            control={form.control}
            name="interaction_notes"
            render={({ field }) => (
              <FormItem className="col-span-1 md:col-span-2 bg-muted/30 p-4 rounded-xl border border-border/80 mt-2">
                <FormLabel>Notas del Registro Externo</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Lead ingresó pidiendo información del curso..." className="rounded-xl" {...field} />
                </FormControl>
                <FormMessage className="text-red-500 text-xs mt-1" />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
}
