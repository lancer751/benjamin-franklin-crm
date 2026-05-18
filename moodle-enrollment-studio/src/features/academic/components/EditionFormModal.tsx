import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/components/ui/popover";
import { Calendar } from "@/core/components/ui/calendar";
import { Loader2, CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/core/components/ui/accordion";
import { useEditionFormModal } from "../hooks/useEditionFormModal";
import { ModalityMap, EditionStatusMap, DurationUnitMap } from "@/core/utils/dictionaries";

interface EditionFormModalProps {
  open: boolean;
  onClose: () => void;
  courseId?: string | null;
  courseCode?: string | null;
  editionId?: string | null;
  courseClassesNumber?: number | null;
}

export default function EditionFormModal({ open, onClose, courseId, courseCode, editionId, courseClassesNumber }: EditionFormModalProps) {
  const {
    form, mode, courses, professors,
    isLoadingEdition, isErrorEdition, isLoadingCourses, isLoadingProfessors,
    startMonth, setStartMonth, endMonth, setEndMonth,
    isPending, onSubmit
  } = useEditionFormModal(open, onClose, courseId, courseCode, editionId, courseClassesNumber);

  const { fields: scheduleFields, append: appendSchedule, remove: removeSchedule } = useFieldArray({
    control: form.control,
    name: "schedules"
  });

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col max-h-[85vh] overflow-hidden py-4 relative">
              {/* Cuerpo del Modal (Área de Scroll) */}
              <div className="flex-1 overflow-y-auto px-1 pb-4">
                <Accordion type="single" collapsible defaultValue="item-general" className="w-full">

                  {/* ITEM 1: DATOS GENERALES */}
                  <AccordionItem value="item-general">
                    <AccordionTrigger className="text-base font-semibold hover:no-underline">Datos Generales</AccordionTrigger>
                    <AccordionContent className="pt-4 pb-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Curso Base */}
                        {!courseId && mode !== "edit" && (
                          <FormField control={form.control} name="course_id" render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Curso Base <span className="text-destructive">*</span></FormLabel>
                              {isLoadingCourses ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin h-4 w-4" /> Cargando...</div>
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
                          )} />
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
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Código de Edición */}
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
                        )} />

                        {/* Modalidad */}
                        <FormField control={form.control} name="modality" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Modalidad <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Elige la modalidad" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(ModalityMap).map(([key, value]) => (
                                  <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Estado */}
                        <FormField control={form.control} name="edition_status" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado de la Edición <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Selecciona el estado" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(EditionStatusMap).map(([key, value]) => (
                                  <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Moodle Course ID */}
                        <FormField control={form.control} name="moodle_course_id" render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Moodle <span className="text-muted-foreground font-normal">(Opcional)</span></FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Ej: 1234"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <p className="text-[0.8rem] text-muted-foreground">ID del curso en el aula virtual de Moodle.</p>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* ITEM 2: DURACIÓN Y HORARIOS */}
                  <AccordionItem value="item-duration">
                    <AccordionTrigger className="text-base font-semibold hover:no-underline">Fechas y Carga Horaria</AccordionTrigger>
                    <AccordionContent className="pt-4 pb-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        )} />

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
                        )} />

                        {/* Duración (Input numérico y Select) */}
                        <div className="flex gap-2 items-end">
                          <FormField control={form.control} name="duration_value" render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Duración <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input type="number" min="1" placeholder="Ej: 4" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="duration_unit" render={({ field }) => (
                            <FormItem className="flex-1">
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger><SelectValue placeholder="Unidad" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(DurationUnitMap).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>

                        <div className="flex gap-4">
                          {/* Horas Totales */}
                          <FormField control={form.control} name="hours_amount" render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>Horas Totales <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input type="number" min="1" placeholder="Ej: 120" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />

                          {/* Número de Clases */}
                          <FormField control={form.control} name="classes_number" render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormLabel>N° de Clases <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input type="number" min="1" placeholder="Ej: 16" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </div>

                      {/* Horarios Dinámicos */}
                      <div className="mt-6 border-t pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold">Horarios de Clase</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendSchedule({ day: "LUNES", slots: [{ start_time: "08:00", end_time: "10:00" }] })}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Añadir Día de Clase
                          </Button>
                        </div>

                        {scheduleFields.length === 0 && (
                          <Alert className="mb-4">
                            <AlertDescription className="text-muted-foreground">
                              No has definido ningún horario. Es recomendable agregar al menos un día de clase.
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-4">
                          {scheduleFields.map((field, index) => (
                            <div key={field.id} className="flex flex-col md:flex-row items-end gap-3 p-4 border rounded-lg bg-muted/10 relative">

                              <FormField control={form.control} name={`schedules.${index}.day`} render={({ field: dayField }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>Día</FormLabel>
                                  <Select onValueChange={dayField.onChange} value={dayField.value}>
                                    <FormControl>
                                      <SelectTrigger><SelectValue placeholder="Día" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"].map(d => (
                                        <SelectItem key={d} value={d}>{d}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )} />

                              <FormField control={form.control} name={`schedules.${index}.slots.0.start_time`} render={({ field: startField }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>Hora Inicio</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...startField} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />

                              <FormField control={form.control} name={`schedules.${index}.slots.0.end_time`} render={({ field: endField }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>Hora Fin</FormLabel>
                                  <FormControl>
                                    <Input type="time" {...endField} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => removeSchedule(index)}
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* ITEM 3: DOCENTE Y ENLACES */}
                  <AccordionItem value="item-teacher">
                    <AccordionTrigger className="text-base font-semibold hover:no-underline">Docente y Enlaces</AccordionTrigger>
                    <AccordionContent className="pt-4 pb-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Docente */}
                        <FormField control={form.control} name={`assigned_professors.0.professor_id`} render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Docente Encargado <span className="text-destructive">*</span></FormLabel>
                            {isLoadingProfessors ? (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin h-4 w-4" /> Cargando...</div>
                            ) : (
                              <Select onValueChange={(val) => {
                                const current = form.getValues("assigned_professors") || [];
                                current[0] = { professor_id: val };
                                form.setValue("assigned_professors", current, { shouldValidate: true, shouldDirty: true });
                              }} value={form.watch("assigned_professors")?.[0]?.professor_id || ""}>
                                <FormControl>
                                  <SelectTrigger><SelectValue placeholder="Selecciona un profesor" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {professors.map((p: any) => (
                                    <SelectItem key={p.id} value={p.id}>{p.user.first_name} {p.user.last_name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Enlace Virtual */}
                        <FormField control={form.control} name="meet_link" render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Enlace Virtual (Meet) (Opcional)</FormLabel>
                            <FormControl><Input type="url" placeholder="https://meet.google.com/..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Enlace WhatsApp */}
                        <FormField control={form.control} name="whatsapp_group_link" render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Enlace Grupo WhatsApp (Opcional)</FormLabel>
                            <FormControl><Input type="url" placeholder="https://chat.whatsapp.com/..." {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </div>

              {/* Footer Fijo */}
              <div className="shrink-0 bg-white pt-4 pb-2 border-t mt-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>Cancelar</Button>
                <Button type="submit" disabled={isPending || isErrorEdition}>
                  {isPending ? (mode === "create" ? "Programando..." : "Actualizando...") : (mode === "create" ? "Programar Edición" : "Guardar Cambios")}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}