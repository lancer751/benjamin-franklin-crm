import { ModalWrapper } from "@/core/components/modals/ModalWrapper";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { useProfessorFormModal } from "../hooks/useProfessorFormModal";
import { Button } from "@/core/components/ui/button";
import { Loader2, UploadCloud, CheckCircle2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/core/components/ui/switch";
import { uploadPdfToCloudinary } from "@/core/lib/uploadService";

interface ProfessorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  professor?: any | null;
}

export const ProfessorFormModal = ({ isOpen, onClose, professor }: ProfessorFormModalProps) => {
  const { form: rawForm, isPending, closeAndReset, onSubmit, isLoadingProfessor } = useProfessorFormModal(
    isOpen,
    onClose,
    professor
  );
  const form = rawForm as any;

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
    <ModalWrapper
      open={isOpen}
      onClose={closeAndReset}
      title={professor ? "Editar Docente" : "Nuevo Docente"}
      subtitle={professor ? "Modifica los datos del docente." : "Ingresa los datos para registrar un nuevo docente en el sistema."}
      maxWidth="max-w-3xl"
      className="sm:max-w-3xl"
    >
      <Form {...form}>
        <form id="professor-form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 max-h-[80vh] overflow-y-auto px-1 py-6 space-y-6">
            <div className="px-5 space-y-6">
              {/* SECCIÓN 1: Información Personal y Profesional */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Información Personal y Profesional
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Juan" {...field} />
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
                        <FormLabel>Apellido <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Pérez" {...field} />
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
                        <FormLabel>Email Personal <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="ejemplo@correo.com" type="email" {...field} />
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
                        <FormLabel>Email Corporativo <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="ejemplo@empresa.com" type="email" {...field} value={field.value || ""} />
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
                        <FormLabel>Celular <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. 987654321" {...field} value={field.value || ""} />
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
                        <FormLabel>Profesión</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. Ingeniero de Sistemas" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="linkedin_account_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cuenta de LinkedIn</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/..." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="curriculum_vitae"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Curriculum Vitae</FormLabel>
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
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* SECCIÓN 2: Configuración de Plataforma (Moodle) */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Configuración de Plataforma (Moodle)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <FormField
                    control={form.control}
                    name="moddle_account_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Moodle</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej. 123" type="number" {...field} value={field.value ?? ""} />
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
                        <FormLabel>Estado de Cuenta Moodle <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "ACTIVE"}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl border-slate-200">
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
                      <FormItem className="flex flex-row items-center justify-between rounded-xl border border-slate-200 p-4 md:col-span-2">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-semibold">Estado del Docente</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            {field.value ? "Activo (Permite asignarle ediciones)" : "Inactivo"}
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
                </div>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-border/50 flex justify-end gap-3 bg-muted/20">
            <Button type="button" variant="outline" onClick={closeAndReset}>Cancelar</Button>
            <Button type="submit" disabled={isPending || isLoadingProfessor}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {professor ? "Guardar Cambios" : "Crear Docente"}
            </Button>
          </div>
        </form>
      </Form>
    </ModalWrapper>
  );
};
