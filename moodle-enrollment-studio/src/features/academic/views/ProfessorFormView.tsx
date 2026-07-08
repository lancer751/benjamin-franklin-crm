import { useState } from "react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/core/components/ui/card";
import { Switch } from "@/core/components/ui/switch";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Loader2, UploadCloud, CheckCircle2, Trash2, ChevronLeft, Save, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { uploadPdfToCloudinary } from "@/core/lib/uploadService";
import { useProfessorForm } from "../hooks/useProfessorForm";

export default function ProfessorFormView() {
  const {
    form,
    isEditMode,
    isLoadingProfessor,
    isError,
    isPending,
    onSubmit,
    handleBack,
  } = useProfessorForm();

  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingPdf(true);
      const secureUrl = await uploadPdfToCloudinary(file);
      form.setValue("curriculum_vitae", secureUrl, { shouldValidate: true });
      toast.success("Curriculum Vitae subido y vinculado con éxito.");
    } catch (error) {
      toast.error("Error al subir el archivo de CV a Cloudinary.");
    } finally {
      setIsUploadingPdf(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto px-4">
      {/* HEADER SUPERIOR */}
      <div className="grid grid-cols-12 gap-8 pt-2 mb-6 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div className="col-span-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm"
              onClick={handleBack}
              disabled={isPending}
              type="button"
            >
              <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {isEditMode ? "Editar Docente" : "Nuevo Docente"}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isEditMode
                  ? "Modifica los datos del expediente del docente seleccionado."
                  : "Ingresa los datos para registrar un nuevo docente en el sistema."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isEditMode && isLoadingProfessor ? (
        <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-sm font-semibold text-slate-500 animate-pulse">Cargando datos del docente...</p>
        </div>
      ) : isError ? (
        <div className="max-w-md mx-auto my-12 text-center space-y-4">
          <Alert variant="destructive" className="rounded-xl">
            <AlertDescription>No se pudo obtener la información del docente o ya no existe en el servidor.</AlertDescription>
          </Alert>
          <Button onClick={handleBack} variant="outline" className="rounded-xl">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-12 gap-8 items-start">
              
              {/* COLUMNA IZQUIERDA: INFORMACIÓN PRINCIPAL (8 columnas) */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                
                {/* SECCIÓN 1: Información General */}
                <Card className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <CardHeader className="py-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80">
                    <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Información General
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Datos personales y de contacto obligatorio del docente.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                              Nombre <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej. Juan"
                                className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                              Apellido <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej. Pérez"
                                className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                              Email Personal <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ejemplo@correo.com"
                                type="email"
                                className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="corporate_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                              Email Corporativo <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="ejemplo@empresa.com"
                                type="email"
                                className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cellphone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                              Celular <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej. 987654321"
                                className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="profession"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                              Profesión
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej. Ingeniero de Sistemas"
                                className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* SECCIÓN 2: Trayectoria Profesional */}
                <Card className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <CardHeader className="py-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80">
                    <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Trayectoria Profesional
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Presencia digital y documento de hoja de vida del docente.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="linkedin_account_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                            Cuenta de LinkedIn
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://linkedin.com/in/..."
                              className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="curriculum_vitae"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                            Curriculum Vitae (PDF)
                          </FormLabel>
                          <FormControl>
                            <div className="flex flex-col gap-2">
                              {isUploadingPdf ? (
                                <div className="flex items-center justify-center border-2 border-dashed border-primary/30 rounded-xl p-5 bg-primary/5 h-[44px]">
                                  <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                                  <span className="text-xs font-medium text-primary">Subiendo PDF...</span>
                                </div>
                              ) : field.value ? (
                                <div className="flex items-center justify-between border border-emerald-200 rounded-xl px-3 py-2 bg-emerald-50/50 h-[44px]">
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <span className="text-xs font-semibold text-emerald-800 shrink-0">CV cargado:</span>
                                      <a
                                        href={field.value}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-emerald-600 underline hover:text-emerald-700 truncate"
                                      >
                                        Ver PDF
                                      </a>
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-full shrink-0 h-8 w-8"
                                    onClick={() => field.onChange("")}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <label className="flex items-center justify-center border-2 border-dashed border-slate-200 hover:border-primary/50 rounded-xl px-4 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors h-[44px]">
                                  <div className="flex items-center gap-2">
                                    <UploadCloud className="h-5 w-5 text-slate-400" />
                                    <span className="text-xs font-semibold text-primary">Subir CV (PDF)</span>
                                  </div>
                                  <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={handlePdfChange}
                                  />
                                </label>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* ACCIONES FOOTER */}
                <div className="flex justify-end gap-3 mt-6 w-full px-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 px-6 h-11 transition-all"
                    onClick={handleBack}
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl btn-primary gap-2 shadow-md shadow-primary/20 px-6 h-11 transition-all"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={16} /> {isEditMode ? "Guardar Cambios" : "Crear Docente"}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* COLUMNA DERECHA: CONFIGURACIÓN PLATAFORMA MOODLE (4 columnas) */}
              <div className="col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-6">
                
                {/* SECCIÓN 3: PLATAFORMA MOODLE */}
                <Card className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/30 dark:bg-slate-900/10 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <CardHeader className="py-4 bg-slate-100/50 dark:bg-slate-900/60 border-b border-slate-200/50 dark:border-slate-800/80">
                    <CardTitle className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Plataforma Moodle
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Detalles y estado de sincronización con el aula virtual.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <FormField
                      control={form.control}
                      name="moddle_account_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                            ID Moodle
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej. 123"
                              type="number"
                              className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary bg-white dark:bg-slate-950"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="moodle_user_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                            Estado de Cuenta Moodle <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || "ACTIVE"}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary bg-white dark:bg-slate-950">
                                <SelectValue placeholder="Selecciona el estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="ACTIVE">Activo</SelectItem>
                              <SelectItem value="SUSPENDED">Suspendido</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-950 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-semibold">Estado del Docente</FormLabel>
                            <div className="text-[11px] text-muted-foreground">
                              {field.value ? "Activo (permite asignaciones)" : "Inactivo"}
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
