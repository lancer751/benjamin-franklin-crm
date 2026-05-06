import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/core/components/ui/accordion";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useLeadFormModal } from "../hooks/useLeadFormModal";

interface LeadFormModalProps {
  open: boolean;
  onClose: () => void;
  leadId?: string | null;
}

export default function LeadFormModal({ open, onClose, leadId }: LeadFormModalProps) {
  const { form, mode, isLoadingLead, isErrorLead, isPending, isLoadingCampaigns, activeCampaigns, onSubmit } = useLeadFormModal(open, onClose, leadId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl w-[95vw]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Crear Nuevo Prospecto" : "Editar Prospecto"}</DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Ingresa los datos del nuevo prospecto para agregarlo al CRM." 
              : "Modifica la información del prospecto existente."}
          </DialogDescription>
        </DialogHeader>

        {mode === "edit" && isLoadingLead ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Cargando datos del prospecto...</p>
          </div>
        ) : mode === "edit" && isErrorLead ? (
          <Alert variant="destructive" className="my-4">
            <AlertDescription>No se pudo obtener la información del prospecto o ya no existe en el servidor.</AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col max-h-[85vh] overflow-hidden py-4">
              
              {/* Cuerpo del Modal (Área de Scroll) */}
              <div className="flex-1 overflow-y-auto pr-2 pb-4">
                <Accordion type="single" collapsible defaultValue="personal-info" className="w-full">
                  
                  {/* ITEM 1: INFORMACIÓN PERSONAL */}
                  <AccordionItem value="personal-info">
                    <AccordionTrigger className="text-base font-semibold hover:no-underline">👤 Información Personal</AccordionTrigger>
                    <AccordionContent className="pt-4 pb-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="first_name" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombres <span className="text-destructive">*</span></FormLabel>
                            <FormControl><Input placeholder="Ej: Juan Pablo" {...field} /></FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}/>
                        
                        <FormField control={form.control} name="middle_name" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apellido Paterno <span className="text-destructive">*</span></FormLabel>
                            <FormControl><Input placeholder="Ej: Pérez" {...field} /></FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}/>
                        
                        <FormField control={form.control} name="last_name" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apellido Materno <span className="text-destructive">*</span></FormLabel>
                            <FormControl><Input placeholder="Ej: Gómez" {...field} /></FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}/>

                        <FormField control={form.control} name="dni" render={({ field }) => (
                          <FormItem>
                            <FormLabel>DNI</FormLabel>
                            <FormControl><Input placeholder="8 dígitos" maxLength={8} {...field} /></FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}/>

                        <FormField control={form.control} name="gender" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Género</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MALE">Masculino</SelectItem>
                                <SelectItem value="FEMALE">Femenino</SelectItem>
                                <SelectItem value="NOT_SPECIFIED">Prefiero no decirlo</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}/>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* ITEM 2: CONTACTO Y UBICACIÓN */}
                  <AccordionItem value="contact-info">
                    <AccordionTrigger className="text-base font-semibold hover:no-underline">📞 Contacto y Ubicación</AccordionTrigger>
                    <AccordionContent className="pt-4 pb-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Fila 1 */}
                        <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Principal <span className="text-destructive">*</span></FormLabel>
                            <FormControl><Input type="email" placeholder="ejemplo@correo.com" {...field} /></FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}/>

                        <FormField control={form.control} name="secondary_email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Secundario</FormLabel>
                            <FormControl><Input type="email" placeholder="Opcional" {...field} /></FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}/>

                        {/* Fila 2 */}
                        <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono Principal <span className="text-destructive">*</span></FormLabel>
                            <FormControl><Input placeholder="Ej: 987654321" {...field} /></FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}/>
                        
                        <div className="hidden md:block"></div> {/* Columna vacía */}

                        {/* Fila 3 */}
                        <FormField control={form.control} name="address" render={({ field }) => (
                          <FormItem className="col-span-1 md:col-span-2">
                            <FormLabel>Dirección 1</FormLabel>
                            <FormControl><Input placeholder="Ej: Av. Principal 123" {...field} /></FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}/>

                        {/* Fila 4 */}
                        <FormField control={form.control} name="second_address" render={({ field }) => (
                          <FormItem className="col-span-1 md:col-span-2">
                            <FormLabel>Dirección 2</FormLabel>
                            <FormControl><Input placeholder="Ej: Dpto 401" {...field} /></FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}/>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* ITEM 3: CLASIFICACIÓN Y ORIGEN */}
                  <AccordionItem value="classification">
                    <AccordionTrigger className="text-base font-semibold hover:no-underline">📊 Clasificación y Origen</AccordionTrigger>
                    <AccordionContent className="pt-4 pb-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="profession" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profesión</FormLabel>
                            <FormControl><Input placeholder="Ej: Ingeniero" {...field} /></FormControl>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}/>

                        <FormField control={form.control} name="primary_campaign_id" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              Campaña de Origen
                              {isLoadingCampaigns && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <SelectTrigger disabled={isLoadingCampaigns}>
                                  <SelectValue placeholder="Selecciona campaña" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Sin campaña</SelectItem>
                                {activeCampaigns.map((c: any) => (
                                  <SelectItem key={c.id} value={c.id}>{c.campaing_name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}/>

                        <FormField control={form.control} name="source" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origen del Lead</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Origen" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MANUAL">Manual / Presencial</SelectItem>
                                <SelectItem value="FACEBOOK">Facebook</SelectItem>
                                <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                                <SelectItem value="WEBSITE">Website</SelectItem>
                                <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                                <SelectItem value="TIKTOK">TikTok</SelectItem>
                                <SelectItem value="REFERRAL">Referido</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}/>

                        {form.watch("source") !== "MANUAL" && (
                          <FormField control={form.control} name="interaction_notes" render={({ field }) => (
                            <FormItem className="col-span-1 md:col-span-2 bg-muted/30 p-3 rounded-lg border border-border mt-2">
                              <FormLabel>Notas del Registro Externo</FormLabel>
                              <FormControl><Input placeholder="Ej: Lead ingresó pidiendo información del curso..." {...field} /></FormControl>
                              <FormMessage className="text-red-500" />
                            </FormItem>
                          )}/>
                        )}

                        <FormField control={form.control} name="lead_status" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado del Lead</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ACTIVE">Activo</SelectItem>
                                <SelectItem value="INACTIVE">Inactivo</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage className="text-red-500" />
                          </FormItem>
                        )}/>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </div>

              {/* Footer Fijo */}
              <div className="shrink-0 bg-white pt-4 pb-2 border-t mt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancelar</Button>
                <Button type="submit" disabled={isPending || isErrorLead}>
                  {isPending ? (mode === "create" ? "Creando..." : "Actualizando...") : (mode === "create" ? "Crear Prospecto" : "Guardar Cambios")}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
