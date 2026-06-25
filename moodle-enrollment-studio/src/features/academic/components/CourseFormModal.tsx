import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Textarea } from "@/core/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import { UploadCloud, X } from "lucide-react";
import { useCourseFormModal } from "../hooks/useCourseFormModal";

interface CourseFormModalProps {
  open: boolean;
  onClose: () => void;
  initialData?: any;
}

export default function CourseFormModal({ open, onClose, initialData }: CourseFormModalProps) {
  const {
    form,
    onSubmit,
    isPending,
    isUploading,
    previewUrl,
    handleImageChange,
    handleRemoveImage,
  } = useCourseFormModal(open, onClose, initialData);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[720px] w-full p-6 gap-0">
        <DialogHeader className="mb-4">
          <DialogTitle>{initialData ? "Editar Curso/Programa" : "Nuevo Curso/Programa"}</DialogTitle>
          <DialogDescription>
            {initialData 
              ? "Modifica los detalles principales del curso." 
              : "Crea la plantilla base de un nuevo curso para el catálogo académico."}
          </DialogDescription>
        </DialogHeader>

        {/* Formulario principal usando Shadcn UI Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-5 gap-5 items-start">
            
            {/* Columna Izquierda: Información del Curso (60%) */}
            <div className="md:col-span-3 grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="grid gap-1.5 space-y-0">
                    <FormLabel className="text-xs font-semibold text-slate-700">
                      Código <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Ej: PYTHONC" 
                        maxLength={7} 
                        className="h-9 uppercase"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classes_number"
                render={({ field }) => (
                  <FormItem className="grid gap-1.5 space-y-0">
                    <FormLabel className="text-xs font-semibold text-slate-700">
                      N° de Clases <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="Ej: 12" 
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                        disabled={isPending}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="grid gap-1.5 col-span-2 space-y-0">
                    <FormLabel className="text-xs font-semibold text-slate-700">
                      Nombre Oficial <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="Ej: Python para Análisis de Datos" 
                        disabled={isPending}
                        className="h-9"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="grid gap-1.5 col-span-2 space-y-0">
                    <FormLabel className="text-xs font-semibold text-slate-700">
                      Tipo de Registro <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending}>
                      <FormControl>
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="COURSE">Curso</SelectItem>
                        <SelectItem value="PROGRAM">Programa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="grid gap-1.5 col-span-2 space-y-0">
                    <FormLabel className="text-xs font-semibold text-slate-700">
                      Descripción Corta
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        value={field.value || ""}
                        placeholder="Breve resumen del curso..." 
                        rows={2} 
                        disabled={isPending}
                        className="resize-none text-sm min-h-[68px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Columna Derecha: Dropzone de Imagen Simétrico (40%) */}
            <div className="md:col-span-2 flex flex-col gap-1.5 h-full">
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-1.5 h-full space-y-0">
                    <FormLabel className="text-xs font-semibold text-slate-700">
                      Portada del Curso <span className="text-destructive">*</span>
                    </FormLabel>
                    
                    <FormControl>
                      {previewUrl ? (
                        <div className="relative w-full h-[216px] rounded-xl overflow-hidden border border-border bg-slate-50 shadow-sm group">
                          <img 
                            src={previewUrl} 
                            alt="Portada" 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 rounded-lg shadow-md z-10"
                            onClick={handleRemoveImage}
                            disabled={isPending}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      ) : (
                        <FormLabel 
                          htmlFor="course-image" 
                          className="flex flex-col items-center justify-center w-full h-[216px] border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 hover:border-primary/50 transition-all cursor-pointer group"
                        >
                          <div className="flex flex-col items-center justify-center text-center px-3">
                            <UploadCloud className="w-8 h-8 mb-2 text-slate-400 group-hover:text-primary transition-colors group-hover:-translate-y-0.5 duration-300" />
                            <p className="text-xs font-medium text-slate-600">
                              Sube la <span className="text-primary font-semibold">portada</span>
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 max-w-[140px]">PNG, JPG o WEBP (Máx 2MB)</p>
                          </div>
                          <input 
                            id="course-image" 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleImageChange}
                            disabled={isPending}
                          />
                        </FormLabel>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pie del Formulario / Botones de Acción */}
            <div className="col-span-1 md:col-span-5 border-t pt-4 mt-2 flex justify-end gap-2 w-full">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="h-9 px-4">
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                {isUploading ? "Subiendo..." : isPending ? "Guardando..." : "Guardar Curso"}
              </Button>
            </div>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}