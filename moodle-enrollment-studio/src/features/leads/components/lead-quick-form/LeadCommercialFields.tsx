import { CheckCircle2, Loader2 } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import { Button } from "@/core/components/ui/button";
import { Textarea } from "@/core/components/ui/textarea";
import { cn } from "@/core/lib/utils";
import type { LeadCreationController } from "../../hooks/useLeadCreationFlow";
import { INTERACTION_TYPE_OPTIONS } from "../../utils/interactionType.constants";

const selectClass = "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60";
const sources = [
  ["FACEBOOK", "Facebook"], ["INSTAGRAM", "Instagram"], ["TIKTOK", "TikTok"],
  ["WHATSAPP", "WhatsApp"], ["WEBSITE", "Sitio web"],
] as const;

interface SectionHeadingProps {
  number: number;
  id: string;
  title: string;
  description: string;
}

const SectionHeading = ({ number, id, title, description }: SectionHeadingProps) => (
  <div className="flex items-start gap-3 border-b border-slate-100 pb-4">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
      {number}
    </span>
    <div>
      <h2 id={id} className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export function LeadCommercialFields({ controller }: { controller: LeadCreationController }) {
  const { form } = controller;
  const campaignId = form.watch("campaignId");
  const notes = form.watch("notes") || "";

  return (
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <section
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5"
        aria-labelledby="assignment-title"
      >
        <SectionHeading
          number={1}
          id="assignment-title"
          title="Campaña y asignación"
          description="Selecciona primero la campaña y luego el asesor responsable."
        />

        <FormField control={form.control} name="campaignId" render={({ field }) => (
          <FormItem>
            <FormLabel>Campaña <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <select
                className={selectClass}
                value={field.value}
                disabled={controller.isLoadingCampaigns}
                onChange={(event) => controller.setCampaign(event.target.value)}
              >
                <option value="">
                  {controller.isLoadingCampaigns ? "Cargando campañas…" : "Seleccionar campaña"}
                </option>
                {controller.campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
            {controller.campaignError && (
              <p role="alert" className="text-sm text-destructive">
                No fue posible cargar las campañas.
              </p>
            )}
          </FormItem>
        )} />

        {controller.canChooseSeller && (
          <FormField control={form.control} name="sellerId" render={({ field }) => {
            const onlySeller = controller.sellerOptions.length === 1
              ? controller.sellerOptions[0]
              : null;
            return (
              <FormItem>
                <FormLabel>Asesor asignado <span className="text-destructive">*</span></FormLabel>
                {controller.isLoadingSellers ? (
                  <FormControl>
                    <div className="flex h-11 items-center gap-2 rounded-xl border border-input bg-slate-50 px-3 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando asesores de la campaña...
                    </div>
                  </FormControl>
                ) : onlySeller ? (
                  <FormControl>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                      <input type="hidden" value={field.value || ""} readOnly />
                      <div className="flex items-center gap-2 text-sm font-medium text-emerald-900">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        {onlySeller.name}
                      </div>
                      <p className="ml-6 mt-0.5 text-xs text-emerald-700">
                        Seleccionado automáticamente
                      </p>
                    </div>
                  </FormControl>
                ) : (
                  <FormControl>
                    <select
                      className={selectClass}
                      value={field.value || ""}
                      disabled={
                        !campaignId
                        || controller.sellerOptions.length === 0
                        || controller.sellerOptionsError
                      }
                      onChange={field.onChange}
                    >
                      <option value="">Seleccionar asesor</option>
                      {controller.sellerOptions.map((seller) => (
                        <option key={seller.userId} value={seller.userId}>{seller.name}</option>
                      ))}
                    </select>
                  </FormControl>
                )}
                <FormMessage />
                {campaignId && controller.sellerOptionsError && (
                  <p role="alert" className="text-sm text-destructive">
                    No fue posible cargar los asesores de esta campaña.
                  </p>
                )}
                {campaignId
                  && !controller.isLoadingSellers
                  && !controller.sellerOptionsError
                  && controller.sellerOptions.length === 0 && (
                    <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      <p className="font-medium">Esta campaña no tiene asesores disponibles para asignación.</p>
                      <p className="mt-1 text-amber-800">
                        Asigna un vendedor a la campaña antes de registrar el prospecto.
                      </p>
                    </div>
                )}
              </FormItem>
            );
          }} />
        )}

        <FormField control={form.control} name="source" render={({ field }) => (
          <FormItem>
            <FormLabel>Origen <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <select className={selectClass} value={field.value} onChange={field.onChange}>
                {sources.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </section>

      <section
        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5"
        aria-labelledby="interaction-title"
      >
        <SectionHeading
          number={2}
          id="interaction-title"
          title="Interacción inicial"
          description="Deja constancia del primer contacto comercial."
        />

        <FormField control={form.control} name="interactionType" render={({ field }) => (
          <FormItem>
            <FormLabel>Tipo de interacción <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {INTERACTION_TYPE_OPTIONS.map(({ value, label }) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={field.value === value ? "default" : "outline"}
                    className={cn("rounded-full", field.value === value && "shadow-sm")}
                    onClick={() => field.onChange(value)}
                    aria-pressed={field.value === value}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notas <span className="text-destructive">*</span></FormLabel>
            <FormControl>
              <Textarea
                rows={7}
                maxLength={255}
                aria-invalid={Boolean(form.formState.errors.notes)}
                placeholder="Describe brevemente el primer contacto..."
                className="min-h-40 resize-y rounded-xl"
                {...field}
              />
            </FormControl>
            <div className="flex items-start justify-between gap-3">
              <FormMessage />
              <p className="shrink-0 text-xs text-muted-foreground">{notes.length}/255 caracteres</p>
            </div>
          </FormItem>
        )} />
      </section>
    </div>
  );
}
