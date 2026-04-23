import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/components/ui/popover";
import { Calendar } from "@/core/components/ui/calendar";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { useEditionFormModal } from "../hooks/useEditionFormModal";

interface EditionFormModalProps {
  open: boolean;
  onClose: () => void;
  courseId?: string | null;
  courseCode?: string | null;
  editionId?: string | null;
}

export default function EditionFormModal({ open, onClose, courseId, courseCode, editionId }: EditionFormModalProps) {
  const {
    form, mode, courses, modalities,
    isLoadingEdition, isErrorEdition, isLoadingCourses, isLoadingModalities,
    startMonth, setStartMonth, endMonth, setEndMonth,
    isPending, onSubmit
  } = useEditionFormModal(open, onClose, courseId, courseCode, editionId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl w-[95vw]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Programar Nueva Edición" : "Editar Edición"}</DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Crea una apertura y asigna el calendario, modalidad y encargado para recibir inscripciones." 
              : "Modifica los datos de la edición seleccionada. Puedes ajustar el código de edición manualmente si es necesario."}
          </DialogDescription>
        </DialogHeader>

        {mode === "edit" && isLoadingEdition ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Cargando datos de la edición...</p>
          </div>
        ) : mode === "edit" && isErrorEdition ? (
          <Alert variant="destructive" className="my-4">
            <AlertDescription>No se pudo obtener la información de la edición o ya no existe en el servidor.</AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Curso Base */}
                {!courseId && mode !== "edit" && (
                  <FormField control={form.control} name="course_id" render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Curso Base <span className="text-destructive">*</span></FormLabel>
                      {isLoadingCourses ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin h-4 w-4"/> Cargando...</div>
                      ) : (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selecciona el curso" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courses.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}/>
                )}

                {/* Edición Número */}
                <FormField control={form.control} name="edition_number" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Edición (1-9) <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="9" 
                        placeholder="Ej: 1" 
                        {...field} 
                        value={field.value || ""} // 🧠 Evita mostrar un NaN o 0 por defecto
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>

                {/* Código de Edición (AHORA ES EDITABLE Y SE AUTO-LLENA) */}
                <FormField control={form.control} name="edition_code" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Edición <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ej: PROG00112026" 
                        maxLength={12} 
                        className="font-mono uppercase bg-muted/20" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>

                {/* Modalidad */}
                <FormField control={form.control} name="modality_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modalidad <span className="text-destructive">*</span></FormLabel>
                    {isLoadingModalities ? (
                       <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin h-4 w-4"/> Cargando...</div>
                    ) : (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Elige la modalidad" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {modalities.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}/>

                {/* Estado */}
                <FormField control={form.control} name="edition_status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado de la Edición <span className="text-destructive">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Selecciona el estado" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SCHEDULED">Programada (Aún no iniciada)</SelectItem>
                        <SelectItem value="OPEN">Abierta a Inscripciones</SelectItem>
                        <SelectItem value="IN_PROGRESS">En Progreso (Dictado Módulo)</SelectItem>
                        <SelectItem value="COMPLETED">Completada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}/>

                {/* Fechas */}
                <FormField control={form.control} name="start_date" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Inicio <span className="text-destructive">*</span></FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Elegir fecha</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} month={startMonth} onMonthChange={setStartMonth} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}/>

                <FormField control={form.control} name="end_date" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Fin <span className="text-destructive">*</span></FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Elegir fecha</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} month={endMonth} onMonthChange={setEndMonth} disabled={(date) => form.watch("start_date") ? date < form.watch("start_date")! : false} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}/>

                {/* Docente */}
                <FormField control={form.control} name="teacher_fullname" render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Docente Encargado <span className="text-destructive">*</span></FormLabel>
                    <FormControl><Input placeholder="Nombre completo del profesor" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>

                {/* Enlace */}
                <FormField control={form.control} name="meet_link" render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Enlace Virtual (Opcional)</FormLabel>
                    <FormControl><Input type="url" placeholder="https://meet.google.com/..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>

              <DialogFooter className="pt-6 mt-2 border-t border-border/50">
                <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancelar</Button>
                <Button type="submit" disabled={isPending || isErrorEdition}>
                  {isPending ? (mode === "create" ? "Programando..." : "Actualizando...") : (mode === "create" ? "Programar Edición" : "Guardar Cambios")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}