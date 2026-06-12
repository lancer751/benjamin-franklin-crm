import { useNavigate } from "react-router-dom";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/core/components/ui/form";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/core/components/ui/card";
import { Loader2, ArrowLeft, Save, User, PhoneCall, Target, MessageSquare } from "lucide-react";
import { useLeadForm } from "../hooks/useLeadForm";

export default function LeadFormView() {
  const navigate = useNavigate();
  const { 
    form, 
    mode, 
    isLoadingLead, 
    isErrorLead, 
    isPending, 
    isLoadingCampaigns, 
    activeCampaigns, 
    onSubmit 
  } = useLeadForm();

  const isEdit = mode === "edit";

  if (isEdit && isLoadingLead) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-slate-500 animate-pulse">Cargando datos del prospecto...</p>
      </div>
    );
  }

  if (isEdit && isErrorLead) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto px-4 py-8">
        <Alert variant="destructive" className="rounded-2xl">
          <AlertDescription>No se pudo obtener la información del prospecto o ya no existe en el servidor.</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate("/prospectos")} className="rounded-xl border-slate-200">
          <ArrowLeft size={16} className="mr-2" /> Volver a Prospectos
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Cabecera Ejecutiva Premium */}
      <div className="border-b border-slate-200/80 dark:border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm shrink-0"
            onClick={() => navigate("/prospectos")}
          >
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {isEdit ? "Editar Detalles del Prospecto" : "Crear Nuevo Prospecto"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isEdit 
                ? "Modifica y actualiza la información comercial y de contacto del lead." 
                : "Registra un nuevo prospecto para iniciar el embudo de inscripción."}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* COLUMNA IZQUIERDA: Datos Personales y de Contacto */}
          <div className="space-y-6">
            
            {/* CARD 1: Información Personal */}
            <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 transition-all">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#005088]/10 text-[#005088] dark:bg-blue-900/30 dark:text-blue-400 shrink-0">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">Información Personal</CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Datos de identidad básicos del prospecto</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Nombres <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Juan Pablo" className="rounded-xl focus-visible:ring-[#005088]" {...field} />
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
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Apellido Paterno <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Pérez" className="rounded-xl focus-visible:ring-[#005088]" {...field} />
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
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Apellido Materno <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Gómez" className="rounded-xl focus-visible:ring-[#005088]" {...field} />
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
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">DNI</FormLabel>
                      <FormControl>
                        <Input placeholder="8 dígitos" maxLength={8} className="rounded-xl font-mono focus-visible:ring-[#005088]" {...field} />
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
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Género</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl focus:ring-[#005088]">
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

                <FormField
                  control={form.control}
                  name="profession"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Profesión</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Ingeniero, Docente" className="rounded-xl focus-visible:ring-[#005088]" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />

              </CardContent>
            </Card>

            {/* CARD 2: Datos de Comunicación y Dirección */}
            <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 transition-all">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#005088]/10 text-[#005088] dark:bg-blue-900/30 dark:text-blue-400 shrink-0">
                    <PhoneCall className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">Comunicación y Ubicación</CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Canales de comunicación y localización</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Email Principal <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="ejemplo@correo.com" className="rounded-xl focus-visible:ring-[#005088]" {...field} />
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
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Email Secundario</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Opcional" className="rounded-xl focus-visible:ring-[#005088]" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cellphone"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Teléfono Celular <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: 987654321" className="rounded-xl focus-visible:ring-[#005088]" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Dirección 1</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Av. Principal 123" className="rounded-xl focus-visible:ring-[#005088]" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="second_address"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Dirección 2</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej: Dpto 401, Residencial San Martín" className="rounded-xl focus-visible:ring-[#005088]" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />

              </CardContent>
            </Card>

          </div>

          {/* COLUMNA DERECHA: Captación, Clasificación e Interacción */}
          <div className="space-y-6">
            
            {/* CARD 3: Clasificación y Origen */}
            <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 transition-all">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#005088]/10 text-[#005088] dark:bg-blue-900/30 dark:text-blue-400 shrink-0">
                    <Target className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">Clasificación y Origen</CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Origen y embudo comercial del lead</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                
                <FormField
                  control={form.control}
                  name="primary_campaign_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                        Campaña de Origen
                        {isLoadingCampaigns && <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />}
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl focus:ring-[#005088]" disabled={isLoadingCampaigns}>
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
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Origen del Lead</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl focus:ring-[#005088]">
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
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Estado del Lead</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl focus:ring-[#005088]">
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

              </CardContent>
            </Card>

            {/* CARD 4: Interacción Inicial */}
            <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900 transition-all">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#005088]/10 text-[#005088] dark:bg-blue-900/30 dark:text-blue-400 shrink-0">
                    <MessageSquare className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100">Interacción Inicial</CardTitle>
                    <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Notas de primer contacto o registro de contexto comercial</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                
                <FormField
                  control={form.control}
                  name="interaction_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-slate-300 font-medium">Notas del Primer Contacto / Interacción Inicial</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Escribe aquí el contexto de la llamada, necesidades del alumno o detalles clave del primer contacto..." 
                          className="rounded-xl min-h-[120px] focus-visible:ring-[#005088] resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs mt-1" />
                    </FormItem>
                  )}
                />

              </CardContent>
            </Card>

            {/* Mensaje de error visual para depuración de campos no válidos */}
            {Object.keys(form.formState.errors).length > 0 && (
              <div className="text-xs text-red-500 font-medium bg-red-50 border border-red-100 p-3 rounded-xl space-y-1">
                <p className="font-bold">No se pudo enviar el formulario. Revisa los siguientes campos:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  {Object.entries(form.formState.errors).map(([field, error]: [string, any]) => (
                    <li key={field} className="capitalize">
                      <strong>{field.replace('_', ' ')}:</strong> {error?.message || "Formato o valor inválido"}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* BOTONES DE ACCIÓN (PIE DE FORMULARIO - Dashboard Style) */}
            <div className="flex justify-end gap-3 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/prospectos")} 
                disabled={isPending}
                className="w-auto px-5 py-2.5 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-semibold"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isPending}
                className="w-auto px-5 py-2.5 rounded-xl bg-[#005088] hover:bg-[#003e6a] text-white shadow-md shadow-blue-500/10 transition-all flex items-center gap-2 font-semibold"
              >
                {isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} /> {isEdit ? "Guardar Cambios" : "Crear Prospecto"}
                  </>
                )}
              </Button>
            </div>

          </div>

        </form>
      </Form>
    </div>
  );
}
