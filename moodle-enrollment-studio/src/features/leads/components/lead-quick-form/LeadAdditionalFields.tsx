import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/core/components/ui/accordion";
import { Button } from "@/core/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import type { LeadFieldsInput } from "../../schemas/leadFieldsSchema";

const selectClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface LeadAdditionalFieldsProps {
  defaultOpen?: boolean;
  showLeadStatus?: boolean;
}

export function LeadAdditionalFields({ defaultOpen = false, showLeadStatus = false }: LeadAdditionalFieldsProps) {
  const form = useFormContext<LeadFieldsInput>();
  const phones = useFieldArray({ control: form.control, name: "additionalPhones" });
  return (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? "additional" : undefined} className="rounded-lg border px-4">
      <AccordionItem value="additional" className="border-0">
        <AccordionTrigger className="hover:no-underline">Agregar más información</AccordionTrigger>
        <AccordionContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField control={form.control} name="middle_name" render={({ field }) => <FormItem><FormLabel>Segundo nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="dni" render={({ field }) => <FormItem><FormLabel>DNI</FormLabel><FormControl><Input inputMode="numeric" maxLength={8} {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="gender" render={({ field }) => <FormItem><FormLabel>Género</FormLabel><FormControl><select className={selectClass} value={field.value} onChange={field.onChange}><option value="MALE">Masculino</option><option value="FEMALE">Femenino</option><option value="NOT_SPECIFIED">Prefiero no especificarlo</option></select></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="profession" render={({ field }) => <FormItem><FormLabel>Profesión</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="secondary_email" render={({ field }) => <FormItem><FormLabel>Correo secundario</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="address" render={({ field }) => <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            {showLeadStatus && <FormField control={form.control} name="lead_status" render={({ field }) => <FormItem><FormLabel>Estado</FormLabel><FormControl><select className={selectClass} value={field.value} onChange={field.onChange}><option value="ACTIVE">Activo</option><option value="INACTIVE">Inactivo</option></select></FormControl><FormMessage /></FormItem>} />}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><div><h3 className="text-sm font-medium">Teléfonos adicionales</h3><p className="text-xs text-muted-foreground">El celular principal siempre se conserva como principal.</p></div><Button type="button" variant="outline" size="sm" onClick={() => phones.append({ number: "", type: "TELEPHONE", id: undefined })}><Plus className="h-4 w-4" />Agregar</Button></div>
            {phones.fields.map((phone, index) => (
              <div key={phone.id} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1fr_180px_auto] sm:items-start">
                <FormField control={form.control} name={`additionalPhones.${index}.number`} render={({ field }) => <FormItem><FormLabel>Número</FormLabel><FormControl><Input inputMode="numeric" placeholder="987654321" {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name={`additionalPhones.${index}.type`} render={({ field }) => <FormItem><FormLabel>Tipo</FormLabel><FormControl><select className={selectClass} value={field.value} onChange={field.onChange}><option value="WHATSAPP">WhatsApp</option><option value="TELEPHONE">Teléfono</option></select></FormControl><FormMessage /></FormItem>} />
                <Button type="button" variant="ghost" size="icon" className="mt-7 text-destructive" onClick={() => phones.remove(index)} aria-label="Eliminar teléfono adicional"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
