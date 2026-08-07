import { CheckCircle2, Loader2, Megaphone, UserCheck } from "lucide-react";
import { Badge } from "@/core/components/ui/badge";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import { Button } from "@/core/components/ui/button";
import { Textarea } from "@/core/components/ui/textarea";
import { cn } from "@/core/lib/utils";
import type { LeadCreationController } from "../../hooks/useLeadCreationFlow";
import { INTERACTION_TYPE_OPTIONS } from "../../utils/interactionType.constants";

const selectClass = "h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60";
const sources = [
  ["FACEBOOK", "Facebook"], ["INSTAGRAM", "Instagram"], ["TIKTOK", "TikTok"],
  ["WHATSAPP", "WhatsApp"], ["WEBSITE", "Sitio web"],
] as const;

export function LeadCommercialFields({ controller }: { controller: LeadCreationController }) {
  const { form } = controller;
  const campaignId = form.watch("campaignId");
  const notes = form.watch("notes") || "";

  return (
    <div className="space-y-4">
      {/* 1. Campaña y asignación (Bloque compacto sin tarjetas enormes) */}
      <section aria-labelledby="assignment-heading" className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="border-b border-slate-100 pb-2">
          <h2 id="assignment-heading" className="text-base font-bold text-slate-900">
            Campaña y asignación
          </h2>
          <p className="text-xs text-slate-500">Configuración comercial de origen y responsable.</p>
        </div>

        {controller.isContextualAdvisorMode ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Campaña fija */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Megaphone className="h-3.5 w-3.5 text-primary" /> Campaña
                </span>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs">
                  Activa
                </Badge>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-900 truncate" title={controller.contextualCampaignName}>
                {controller.contextualCampaignName || "Cargando campaña..."}
              </p>
            </div>

            {/* Asesor fijo */}
            {controller.isAdvisorValidInCampaign ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5 text-primary" /> Asesor
                  </span>
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs">
                    Asignado
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-900 truncate" title={controller.contextualSellerName}>
                  {controller.contextualSellerName || "Asesor de ventas"}
                </p>
              </div>
            ) : (
              <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <p className="font-bold">Asesor no disponible</p>
                <p className="text-xs text-amber-800">El asesor no está disponible en esta campaña.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Selector Campaña */}
            {controller.isContextualMode ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Campaña</span>
                <p className="font-bold text-slate-800 text-xs truncate" title={controller.contextualCampaignName}>
                  {controller.contextualCampaignName}
                </p>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="campaignId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Campaña <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <select
                        className={selectClass}
                        value={field.value}
                        disabled={controller.isLoadingCampaigns}
                        onChange={(event) => controller.setCampaign(event.target.value)}
                      >
                        <option value="">
                          {controller.isLoadingCampaigns ? "Cargando…" : "Seleccionar campaña"}
                        </option>
                        {controller.campaigns.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            )}

            {/* Selector Asesor */}
            {controller.canChooseSeller && (
              <FormField
                control={form.control}
                name="sellerId"
                render={({ field }) => {
                  const onlySeller = controller.sellerOptions.length === 1 ? controller.sellerOptions[0] : null;
                  return (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Asesor asignado <span className="text-destructive">*</span></FormLabel>
                      {controller.isLoadingSellers ? (
                        <div className="flex h-9 items-center gap-1.5 rounded-lg border border-input bg-slate-50 px-2.5 text-xs text-muted-foreground">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cargando…
                        </div>
                      ) : onlySeller ? (
                        <div className="flex h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-medium text-emerald-900">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="truncate">{onlySeller.name}</span>
                        </div>
                      ) : (
                        <FormControl>
                          <select
                            className={selectClass}
                            value={field.value || ""}
                            disabled={!campaignId || controller.sellerOptions.length === 0 || controller.sellerOptionsError}
                            onChange={field.onChange}
                          >
                            <option value="">Seleccionar asesor</option>
                            {controller.sellerOptions.map((s) => (
                              <option key={s.userId} value={s.userId}>{s.name}</option>
                            ))}
                          </select>
                        </FormControl>
                      )}
                    <FormMessage className="text-xs" />
                    </FormItem>
                  );
                }}
              />
            )}

            {/* Origen */}
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem className={controller.isContextualMode && !controller.canChooseSeller ? "sm:col-span-1" : ""}>
                  <FormLabel className="text-sm font-semibold">Origen <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <select className={selectClass} value={field.value} onChange={field.onChange}>
                      {sources.map(([val, lbl]) => (
                        <option key={val} value={val}>{lbl}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Origen en modo contextual asesor */}
        {controller.isContextualAdvisorMode && (
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem className="pt-1">
                <FormLabel className="text-sm font-semibold">Origen <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <select className={selectClass} value={field.value} onChange={field.onChange}>
                    {sources.map(([val, lbl]) => (
                      <option key={val} value={val}>{lbl}</option>
                    ))}
                  </select>
                </FormControl>
                  <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        )}
      </section>

      {/* 2. Interacción inicial (Inmediatamente debajo) */}
      <section aria-labelledby="interaction-heading" className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="border-b border-slate-100 pb-2">
          <h2 id="interaction-heading" className="text-base font-bold text-slate-900">
            Interacción inicial
          </h2>
          <p className="text-xs text-slate-500">Primer contacto comercial registrado.</p>
        </div>

        <FormField
          control={form.control}
          name="interactionType"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-semibold">Tipo de interacción <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-1.5">
                  {INTERACTION_TYPE_OPTIONS.map(({ value, label }) => (
                    <Button
                      key={value}
                      type="button"
                      size="sm"
                      variant={field.value === value ? "default" : "outline"}
                      className={cn("h-8 px-3 text-sm rounded-full font-medium", field.value === value && "shadow-xs")}
                      onClick={() => field.onChange(value)}
                      aria-pressed={field.value === value}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-sm font-semibold">Notas <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  maxLength={255}
                  placeholder="Describe brevemente el primer contacto..."
                  className="min-h-24 text-sm resize-y rounded-lg p-2.5"
                  {...field}
                />
              </FormControl>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <FormMessage />
                <span>{notes.length}/255 caracteres</span>
              </div>
            </FormItem>
          )}
        />
      </section>
    </div>
  );
}
