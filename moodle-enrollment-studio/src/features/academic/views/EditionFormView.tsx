import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/core/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/components/ui/popover";
import { Calendar } from "@/core/components/ui/calendar";
import { Loader2, CalendarIcon, Plus, Trash2, X, ChevronLeft, Save, GraduationCap, MapPin, Calendar as CalendarDays, Users, Clock, Info, ShieldCheck } from "lucide-react";
import { useFieldArray } from "react-hook-form";
import { format } from "date-fns";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/core/components/ui/accordion";
import { Badge } from "@/core/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/core/components/ui/card";
import { useEditionFormModal } from "../hooks/useEditionFormModal";
import { ModalityMap, EditionStatusMap, DurationUnitMap } from "@/core/utils/dictionaries";

export default function EditionFormView() {
  const navigate = useNavigate();
  const { id: paramEditionId } = useParams<{ id: string }>();
  const location = useLocation();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const actualCourseId = queryParams.get("courseId") || location.state?.courseId || null;

  const {
    form, mode, courses, professors,
    isLoadingEdition, isErrorEdition, isLoadingCourses, isLoadingProfessors,
    startMonth, setStartMonth, endMonth, setEndMonth,
    isPending, onSubmit
  } = useEditionFormModal(true, undefined);

  const { fields: scheduleFields, append: appendSchedule, remove: removeSchedule } = useFieldArray({
    control: form.control,
    name: "schedules"
  });

  const { fields: professorFields, append: appendProfessor, remove: removeProfessor } = useFieldArray({
    control: form.control,
    name: "assigned_professors"
  });

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      const fallbackUrl = actualCourseId ? `/admin/cursos/${actualCourseId}` : "/admin/cursos";
      navigate(fallbackUrl);
    }
  };

  // Watched fields for dynamic side panel
  const watchCourseId = form.watch("course_id");
  const watchStatus = form.watch("edition_status") || "SCHEDULED";
  const watchModality = form.watch("modality");
  const watchStartDate = form.watch("start_date");
  const watchEndDate = form.watch("end_date");
  const watchCode = form.watch("edition_code");
  const watchHours = form.watch("hours_amount");
  const watchClasses = form.watch("classes_number");
  const watchDurationVal = form.watch("duration_value");
  const watchDurationUnit = form.watch("duration_unit");

  const selectedCourseName = useMemo(() => {
    return courses.find((c: any) => c.id === (watchCourseId || actualCourseId))?.name || "Sin curso seleccionado";
  }, [courses, watchCourseId, actualCourseId]);

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto px-4">
      {/* HEADER SUPERIOR (NO STICKY, GRID DE 12 COLUMNAS) */}
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
                {mode === "create" ? "Programar Nueva Edición" : "Editar Edición"}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mode === "create"
                  ? "Crea una apertura y asigna el calendario, modalidad y encargado para recibir inscripciones."
                  : "Modifica los datos de la edición seleccionada. Puedes ajustar el código de edición manualmente si es necesario."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {mode === "edit" && isLoadingEdition ? (
        <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-sm font-semibold text-slate-500 animate-pulse">Cargando datos de la edición...</p>
        </div>
      ) : mode === "edit" && isErrorEdition ? (
        <div className="max-w-md mx-auto my-12 text-center space-y-4">
          <Alert variant="destructive" className="rounded-xl">
            <AlertDescription>No se pudo obtener la información de la edición o ya no existe en el servidor.</AlertDescription>
          </Alert>
          <Button onClick={handleBack} variant="outline" className="rounded-xl">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* GRID LAYOUT DE 12 COLUMNAS */}
            <div className="grid grid-cols-12 gap-8 items-start">
              
              {/* COLUMNA IZQUIERDA: FORMULARIO PRINCIPAL (8 columnas) */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                <Card className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <CardContent className="p-6">
                    <Accordion type="single" collapsible defaultValue="item-general" className="w-full">
                      
                      {/* ITEM 1: DATOS GENERALES */}
                      <AccordionItem value="item-general" className="border-b border-slate-200 dark:border-slate-800">
                        <AccordionTrigger className="text-base font-semibold hover:no-underline text-slate-900 dark:text-slate-100">
                          Datos Generales
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Curso Base */}
                            {!actualCourseId && mode !== "edit" && (
                              <FormField control={form.control} name="course_id" render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                  <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                                    Curso Base <span className="text-destructive">*</span>
                                  </FormLabel>
                                  {isLoadingCourses ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Loader2 className="animate-spin h-4 w-4 text-primary" /> Cargando cursos...
                                    </div>
                                  ) : (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary">
                                          <SelectValue placeholder="Selecciona el curso" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="rounded-xl">
                                        {courses.map((c: any) => (
                                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
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
                                <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                                  Número de Edición (1-9) <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    max="9"
                                    placeholder="Ej: 1"
                                    className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary"
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
                                <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                                  Código de Edición <span className="text-destructive">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ej: PROG00112026"
                                    className="font-mono uppercase bg-muted/20 h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary"
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
                                <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                                  Modalidad <span className="text-destructive">*</span>
                                </FormLabel>
                                <Select key={field.value || "modality-empty"} onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary">
                                      <SelectValue placeholder="Elige la modalidad" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="rounded-xl">
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
                                <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                                  Estado de la Edición <span className="text-destructive">*</span>
                                </FormLabel>
                                <Select key={field.value || "status-empty"} onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary">
                                      <SelectValue placeholder="Selecciona el estado" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="rounded-xl">
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
                                <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                                  ID Moodle <span className="text-muted-foreground font-normal">(Opcional)</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Ej: 1234"
                                    className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary"
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <p className="text-[11px] text-muted-foreground italic">ID del curso en el aula virtual de Moodle.</p>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      {/* ITEM 2: DURACIÓN Y HORARIOS */}
                      <AccordionItem value="item-duration" className="border-b border-slate-200 dark:border-slate-800">
                        <AccordionTrigger className="text-base font-semibold hover:no-underline text-slate-900 dark:text-slate-100">
                          Fechas y Carga Horaria
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Fecha de Inicio */}
                            <FormField control={form.control} name="start_date" render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                                  Fecha de Inicio <span className="text-destructive">*</span>
                                </FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button variant="outline" className={`w-full h-11 rounded-xl border-slate-200 dark:border-slate-800 pl-3 text-left font-normal shadow-sm ${!field.value && "text-muted-foreground"}`}>
                                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                                        {field.value ? format(field.value, "PPP") : <span>Elegir fecha</span>}
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} month={startMonth} onMonthChange={setStartMonth} initialFocus />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )} />

                            {/* Fecha de Fin */}
                            <FormField control={form.control} name="end_date" render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                                  Fecha de Fin <span className="text-destructive">*</span>
                                </FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button variant="outline" className={`w-full h-11 rounded-xl border-slate-200 dark:border-slate-800 pl-3 text-left font-normal shadow-sm ${!field.value && "text-muted-foreground"}`}>
                                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                                        {field.value ? format(field.value, "PPP") : <span>Elegir fecha</span>}
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} month={endMonth} onMonthChange={setEndMonth} disabled={(date) => form.watch("start_date") ? date < form.watch("start_date")! : false} initialFocus />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )} />

                            {/* Duración (Input numérico y Select) */}
                            <div className="flex gap-4 items-end">
                              <FormField control={form.control} name="duration_value" render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                                    Duración <span className="text-destructive">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input type="number" min="1" placeholder="Ej: 4" className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary" {...field} value={field.value || ""} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name="duration_unit" render={({ field }) => (
                                <FormItem className="flex-1">
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary"><SelectValue placeholder="Unidad" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="rounded-xl">
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
                                  <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                                    Horas Totales <span className="text-destructive">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input type="number" min="1" placeholder="Ej: 120" className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary" {...field} value={field.value || ""} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />

                              {/* Número de Clases */}
                              <FormField control={form.control} name="classes_number" render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                                    N° de Clases <span className="text-destructive">*</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input type="number" min="1" placeholder="Ej: 16" className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary" {...field} value={field.value || ""} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                            </div>
                          </div>

                          {/* Horarios Dinámicos */}
                          <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Horarios de Clase</h4>
                                <p className="text-xs text-muted-foreground">Define los días y rangos horarios de la edición académica.</p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-slate-200 hover:bg-slate-50 gap-2 h-9 px-4 shadow-sm"
                                onClick={() => appendSchedule({ day: "LUNES", slots: [{ start_time: "08:00", end_time: "10:00" }] })}
                              >
                                <Plus className="w-4 h-4" />
                                Añadir Día
                              </Button>
                            </div>

                            {scheduleFields.length === 0 && (
                              <Alert className="mb-4 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 rounded-xl">
                                <AlertDescription className="text-amber-800 dark:text-amber-300 text-xs">
                                  No has definido ningún horario. Es recomendable agregar al menos un día de clase.
                                </AlertDescription>
                              </Alert>
                            )}

                            <div className="space-y-4">
                              {scheduleFields.map((field, index) => (
                                <div key={field.id} className="flex flex-col md:flex-row items-end gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-900/20 relative">
                                  <FormField control={form.control} name={`schedules.${index}.day`} render={({ field: dayField }) => (
                                    <FormItem className="flex-1 w-full">
                                      <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Día</FormLabel>
                                      <Select onValueChange={dayField.onChange} value={dayField.value}>
                                        <FormControl>
                                          <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary"><SelectValue placeholder="Día" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-xl">
                                          {["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"].map(d => (
                                            <SelectItem key={d} value={d}>{d}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )} />

                                  <FormField control={form.control} name={`schedules.${index}.slots.0.start_time`} render={({ field: startField }) => (
                                    <FormItem className="flex-1 w-full">
                                      <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Hora Inicio</FormLabel>
                                      <FormControl>
                                        <Input type="time" className="h-10 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary" {...startField} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )} />

                                  <FormField control={form.control} name={`schedules.${index}.slots.0.end_time`} render={({ field: endField }) => (
                                    <FormItem className="flex-1 w-full">
                                      <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Hora Fin</FormLabel>
                                      <FormControl>
                                        <Input type="time" className="h-10 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary" {...endField} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )} />

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive h-10 w-10 rounded-xl border border-transparent hover:border-destructive/20 shrink-0 shadow-sm"
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
                      <AccordionItem value="item-teacher" className="border-none">
                        <AccordionTrigger className="text-base font-semibold hover:no-underline text-slate-900 dark:text-slate-100">
                          Docente y Enlaces
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Docente */}
                            <div className="md:col-span-2 space-y-3">
                              <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block flex items-center justify-between">
                                <span>Docente Encargado <span className="text-destructive">*</span></span>
                                {professorFields.length > 0 && (
                                  <span className="text-[10px] text-muted-foreground font-normal lowercase tracking-normal">({professorFields.length} asignado/s)</span>
                                )}
                              </FormLabel>
                              
                              <div className="flex flex-wrap gap-2 mb-2 p-3 border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/10 rounded-xl min-h-[50px] items-center">
                                {professorFields.length === 0 ? (
                                  <Badge variant="outline" className="text-muted-foreground border-dashed bg-transparent py-1 px-3 rounded-xl">
                                    Ningún docente asignado aún
                                  </Badge>
                                ) : (
                                  professorFields.map((field, index) => {
                                    const p = professors.find((prof: any) => prof.id === (field as any).professor_id);
                                    return (
                                      <Badge key={field.id} variant="secondary" className="flex items-center gap-1.5 py-1 px-3 rounded-xl text-xs font-semibold bg-primary/10 text-primary border-primary/20">
                                        {p ? `${p.name} ${p.lastname}` : "Docente"}
                                        <button
                                          type="button"
                                          className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full outline-none focus:ring-1 ring-primary"
                                          onClick={() => removeProfessor(index)}
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </Badge>
                                    );
                                  })
                                )}
                              </div>

                              {form.formState.errors.assigned_professors && professorFields.length === 0 && (
                                <p className="text-[11px] font-semibold text-destructive mt-1">
                                  {form.formState.errors.assigned_professors.message as string || "Debe asignar al menos un docente"}
                                </p>
                              )}

                              {isLoadingProfessors ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Loader2 className="animate-spin h-4 w-4 text-primary" /> Cargando personal docente...
                                </div>
                              ) : (
                                <Select
                                  onValueChange={(val) => {
                                    const exists = form.getValues("assigned_professors")?.some((f: any) => f.professor_id === val);
                                    if (!exists) {
                                      appendProfessor({ professor_id: val });
                                    }
                                  }}
                                  value=""
                                >
                                  <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary">
                                    <SelectValue placeholder="Selecciona un profesor para agregar..." />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl">
                                    {professors.map((p: any) => (
                                      <SelectItem key={p.id} value={p.id}>
                                        {p.name} {p.lastname}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>

                            {/* Enlace Virtual */}
                            <FormField control={form.control} name="meet_link" render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                                  {watchModality === "VIRTUAL" || watchModality === "HIBRIDO" ? (
                                    <>
                                      ENLACE VIRTUAL (MEET) <span className="text-destructive">*</span>
                                    </>
                                  ) : (
                                    "Enlace Virtual (Meet) (Opcional)"
                                  )}
                                </FormLabel>
                                <FormControl>
                                  <Input type="url" placeholder="https://meet.google.com/..." className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />

                            {/* Enlace WhatsApp */}
                            <FormField control={form.control} name="whatsapp_group_link" render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Enlace Grupo WhatsApp (Opcional)</FormLabel>
                                <FormControl>
                                  <Input type="url" placeholder="https://chat.whatsapp.com/..." className="h-11 rounded-xl border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>

                {/* FOOTER DE ACCIONES EN EL FLUJO DEL DOCUMENTO */}
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
                    disabled={isPending || isErrorEdition}
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={16} /> {mode === "create" ? "Programar Edición" : "Guardar Cambios"}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* COLUMNA DERECHA: INFORMACIÓN ADICIONAL / LIVE SUMMARY (4 columnas) */}
              <div className="col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-6">
                
                {/* CARD 1: ESTADO Y CÓDIGO */}
                <Card className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 py-4">
                    <CardTitle className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck size={14} className="text-primary" /> Estado y Cohorte
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Curso Base</span>
                      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <GraduationCap size={16} className="text-primary/70 shrink-0" />
                        <span className="truncate">{selectedCourseName}</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Código Oficial</span>
                        <Badge variant="outline" className="font-mono text-[11px] font-bold bg-slate-50/50 dark:bg-slate-900 px-2.5 py-1 rounded-lg border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                          {watchCode || "TBD"}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Modalidad</span>
                        <Badge variant="outline" className="text-[11px] font-semibold bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary-foreground border-transparent px-2.5 py-1 rounded-lg">
                          <MapPin size={11} className="mr-1 inline shrink-0" />
                          {ModalityMap[watchModality as keyof typeof ModalityMap] || "TBD"}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Estado Cohorte</span>
                      <Badge
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold tracking-wide border-transparent ${
                          watchStatus === "OPEN" || watchStatus === "IN_PROGRESS"
                            ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300"
                            : watchStatus === "SCHEDULED"
                            ? "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300"
                            : "bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {EditionStatusMap[watchStatus as keyof typeof EditionStatusMap] || watchStatus}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* CARD 2: DETALLES DE PLANIFICACIÓN */}
                <Card className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 py-4">
                    <CardTitle className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Clock size={14} className="text-primary" /> Planificación y Carga
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Fecha Inicio</span>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <CalendarDays size={13} className="text-slate-400 shrink-0" />
                          <span>{watchStartDate ? format(new Date(watchStartDate), "dd/MM/yyyy") : "Por definir"}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Fecha Fin</span>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <CalendarDays size={13} className="text-slate-400 shrink-0" />
                          <span>{watchEndDate ? format(new Date(watchEndDate), "dd/MM/yyyy") : "Por definir"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 grid grid-cols-3 gap-2 text-center bg-slate-50/20 dark:bg-slate-900/10 p-2 rounded-xl border">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider mb-0.5">Horas</span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{watchHours || "0"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider mb-0.5">Clases</span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{watchClasses || "0"}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider mb-0.5">Semanas</span>
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                          {watchDurationVal || "0"} {DurationUnitMap[watchDurationUnit as keyof typeof DurationUnitMap]?.substring(0, 3)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CARD 3: EQUIPO ASIGNADO */}
                <Card className="shadow-sm border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80 py-4">
                    <CardTitle className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Users size={14} className="text-primary" /> Equipo & Horarios
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Profesor Principal</span>
                      {professorFields.length === 0 ? (
                        <span className="text-xs italic text-muted-foreground">Ningún docente asignado aún</span>
                      ) : (
                        <div className="space-y-1.5">
                          {professorFields.map((field) => {
                            const p = professors.find((prof: any) => prof.id === (field as any).professor_id);
                            return (
                              <div key={field.id} className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                <span>{p ? `${p.name} ${p.lastname}` : "Docente"}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Horas Semanales</span>
                      {scheduleFields.length === 0 ? (
                        <span className="text-xs italic text-muted-foreground">Sin horarios configurados</span>
                      ) : (
                        <div className="space-y-1">
                          {scheduleFields.map((field, idx) => (
                            <div key={field.id} className="text-[11px] text-slate-600 dark:text-slate-400 flex justify-between">
                              <span className="font-bold">{(field as any).day}</span>
                              <span className="font-mono">
                                {(field as any).slots?.[0]?.start_time || "08:00"} - {(field as any).slots?.[0]?.end_time || "10:00"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
