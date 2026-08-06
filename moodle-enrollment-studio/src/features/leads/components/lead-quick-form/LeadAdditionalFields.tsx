import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/core/components/ui/accordion";
import { Button } from "@/core/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import type { LeadFieldsInput } from "../../schemas/leadFieldsSchema";

const selectClass = "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface LeadAdditionalFieldsProps {
  defaultOpen?: boolean;
}

export function LeadAdditionalFields({ defaultOpen = false }: LeadAdditionalFieldsProps) {
  const form = useFormContext<LeadFieldsInput>();
  const phones = useFieldArray({ control: form.control, name: "additionalPhones" });

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultOpen ? "additional" : undefined}
      className="rounded-xl border border-slate-200 bg-white px-4 shadow-sm"
    >
      <AccordionItem value="additional" className="border-0">
        <AccordionTrigger className="py-3 text-sm font-bold text-slate-700 hover:no-underline">
          ▼ Información adicional (Opcional)
        </AccordionTrigger>
        <AccordionContent className="space-y-4 pt-1 pb-3">
          <div className="grid gap-3 md:grid-cols-2">
            <FormField
              control={form.control}
              name="middle_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-600">Segundo nombre</FormLabel>
                  <FormControl><Input className="h-8 text-sm" placeholder="Segundo nombre" {...field} /></FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-600">DNI</FormLabel>
                  <FormControl><Input className="h-8 text-sm" inputMode="numeric" maxLength={8} placeholder="12345678" {...field} /></FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-600">Género</FormLabel>
                  <FormControl>
                    <select className={selectClass} value={field.value} onChange={field.onChange}>
                      <option value="MALE">Masculino</option>
                      <option value="FEMALE">Femenino</option>
                      <option value="NOT_SPECIFIED">Prefiero no especificarlo</option>
                    </select>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-600">Profesión</FormLabel>
                  <FormControl><Input className="h-8 text-sm" placeholder="Ej. Ingeniero" {...field} /></FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-600">Dirección</FormLabel>
                  <FormControl><Input className="h-8 text-sm" placeholder="Dirección de domicilio" {...field} /></FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secondary_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-600">Correo secundario</FormLabel>
                  <FormControl><Input className="h-8 text-sm" type="email" placeholder="secundario@ejemplo.com" {...field} /></FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Teléfonos adicionales</h3>
                <p className="text-xs text-slate-500">El celular principal siempre se conserva como contacto primario.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-sm gap-1 font-semibold"
                onClick={() => phones.append({ number: "", type: "TELEPHONE", id: undefined })}
              >
                <Plus className="h-3.5 w-3.5" /> Agregar
              </Button>
            </div>
            {phones.fields.map((phone, index) => (
              <div key={phone.id} className="grid gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 sm:grid-cols-[1fr_160px_auto] sm:items-end">
                <FormField
                  control={form.control}
                  name={`additionalPhones.${index}.number`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Número</FormLabel>
                      <FormControl><Input className="h-8 text-sm" inputMode="numeric" placeholder="987654321" {...field} /></FormControl>
                  <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`additionalPhones.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Tipo</FormLabel>
                      <FormControl>
                        <select className={selectClass} value={field.value} onChange={field.onChange}>
                          <option value="WHATSAPP">WhatsApp</option>
                          <option value="TELEPHONE">Teléfono</option>
                        </select>
                      </FormControl>
                  <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive self-end"
                  onClick={() => phones.remove(index)}
                  aria-label="Eliminar teléfono adicional"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
