import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import { Button } from "@/core/components/ui/button";
import { Textarea } from "@/core/components/ui/textarea";
import { cn } from "@/core/lib/utils";
import type { LeadCreationController } from "../../hooks/useLeadCreationFlow";

const selectClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const sources = [
  ["FACEBOOK", "Facebook"], ["INSTAGRAM", "Instagram"], ["TIKTOK", "TikTok"],
  ["WHATSAPP", "WhatsApp"], ["WEBSITE", "Sitio web"],
] as const;
const interactionTypes = [
  ["CALL", "Llamada"], ["WHATSAPP", "WhatsApp"], ["EMAIL", "Correo"],
  ["MEETING", "Reunión"], ["WEBSITE_FORM", "Formulario web"], ["SELL", "Venta"],
] as const;

export function LeadCommercialFields({ controller }: { controller: LeadCreationController }) {
  const { form } = controller;
  const campaignId = form.watch("campaignId");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-4" aria-labelledby="assignment-title">
        <div><h2 id="assignment-title" className="text-base font-semibold">Campaña y asignación</h2><p className="text-sm text-muted-foreground">Define el contexto comercial del registro.</p></div>
        <FormField control={form.control} name="campaignId" render={({ field }) => (
          <FormItem><FormLabel>Campaña <span className="text-destructive">*</span></FormLabel><FormControl><select className={selectClass} value={field.value} disabled={controller.isLoadingCampaigns} onChange={(event) => controller.setCampaign(event.target.value)}><option value="">{controller.isLoadingCampaigns ? "Cargando campañas…" : "Selecciona una campaña"}</option>{controller.campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select></FormControl><FormMessage />{controller.campaignError && <p className="text-sm text-destructive">No fue posible cargar las campañas.</p>}</FormItem>
        )} />
        <FormField control={form.control} name="source" render={({ field }) => (
          <FormItem><FormLabel>Origen <span className="text-destructive">*</span></FormLabel><FormControl><select className={selectClass} value={field.value} onChange={field.onChange}>{sources.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></FormControl><FormMessage /></FormItem>
        )} />
        {controller.canChooseSeller && (
          <FormField control={form.control} name="sellerId" render={({ field }) => (
            <FormItem><FormLabel>Asesor <span className="text-destructive">*</span></FormLabel><FormControl><select className={selectClass} value={field.value || ""} disabled={!campaignId || controller.sellerOptions.length === 0} onChange={field.onChange}><option value="">Selecciona un asesor</option>{controller.sellerOptions.map((seller) => <option key={seller.id} value={seller.id}>{seller.name}</option>)}</select></FormControl><FormMessage />{campaignId && controller.sellerOptions.length === 0 && <p className="text-sm text-destructive">No hay asesores asignados a esta campaña.</p>}</FormItem>
          )} />
        )}
      </section>

      <section className="space-y-4" aria-labelledby="interaction-title">
        <div><h2 id="interaction-title" className="text-base font-semibold">Interacción inicial</h2><p className="text-sm text-muted-foreground">Deja constancia del primer contacto comercial.</p></div>
        <FormField control={form.control} name="interactionType" render={({ field }) => (
          <FormItem><FormLabel>Tipo de interacción <span className="text-destructive">*</span></FormLabel><FormControl><div className="flex flex-wrap gap-2">{interactionTypes.map(([value, label]) => <Button key={value} type="button" size="sm" variant={field.value === value ? "default" : "outline"} className={cn("rounded-full", field.value === value && "shadow-sm")} onClick={() => field.onChange(value)} aria-pressed={field.value === value}>{label}</Button>)}</div></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem><FormLabel>Notas <span className="text-destructive">*</span></FormLabel><FormControl><Textarea rows={6} placeholder="Describe brevemente el resultado del primer contacto, la necesidad del prospecto o el acuerdo alcanzado." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
      </section>
    </div>
  );
}
