import { ArrowLeft, BookOpen, Calendar as CalendarIcon, MapPin, Plus, Edit, MoreVertical, Eye, Trash } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Card, CardContent } from "@/core/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/core/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/core/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/core/components/ui/alert-dialog";
import { useCourseDetail } from "../hooks/useCourseDetail";
import { translateEnum, EditionStatusMap, ModalityMap } from "@/core/utils/dictionaries";
import { useNavigate } from "react-router-dom";

export default function CourseDetailView() {
  const navigate = useNavigate();
  const {
    course,
    isLoading,
    isError,
    modals,
    selection,
    actions,
    deleteIsPending,
  } = useCourseDetail();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full fade-in p-8 items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground mt-4 font-medium tracking-wide">Cargando expediente del curso...</p>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="flex flex-col gap-6 w-full fade-in p-8 items-center justify-center h-[60vh] text-center">
        <div className="bg-destructive/10 text-destructive p-5 rounded-full mb-4">
          <BookOpen size={40} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Curso no encontrado</h2>
        <p className="text-muted-foreground max-w-[400px]">
          Ha ocurrido un error al intentar cargar el curso, o quizás fue eliminado permanentemente del sistema.
        </p>
        <Button onClick={actions.goBack} variant="outline" className="mt-4 border-border/80">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Catálogo
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full fade-in pb-10">
      {/* Botón de regreso */}
      <div>
        <Button 
          onClick={actions.goBack} 
          variant="ghost" 
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 pl-2 pr-4 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Catálogo
        </Button>
      </div>

      {/* Hero Section del Perfil del Curso */}
      <Card className="overflow-hidden border-border/60 shadow-sm relative rounded-xl">
        {/* Decorative Background Banner */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent h-32 w-full absolute top-0 left-0"></div>
        
        <CardContent className="p-8 pt-[4.5rem] relative z-10">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
            <Avatar className="w-32 h-32 border-4 border-background shadow-md rounded-xl bg-card shrink-0">
              <AvatarImage src={course.image_url} alt={course.name} className="object-cover" />
              <AvatarFallback className="rounded-xl bg-muted text-4xl text-muted-foreground font-bold">
                {course.code?.substring(0, 2) || "CB"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-3 mb-2.5">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-3 py-1 shadow-sm">
                  {course.code || "SIN CÓDIGO"}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground bg-muted/40 px-2 py-1 rounded-md border border-border/40">
                  ID: {course.id}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                {course.name}
              </h1>
            </div>
          </div>
          
          <div className="mt-8 border-t border-border/50 pt-6">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Descripción General
            </h3>
            <p className="text-foreground/90 leading-relaxed max-w-[900px]">
              {course.description || "Este curso corporativo no cuenta con una descripción detallada en este momento."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sección de Ediciones */}
      <div className="flex flex-col gap-5 mt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Ediciones Programadas</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Control de aparturas y grupos registrados para este curso.</p>
          </div>
          <Button 
            className="flex items-center gap-2 shadow-sm rounded-lg shrink-0"
            onClick={() => navigate(`/admin/academic/editions/nuevo?courseId=${course.id}&courseCode=${course.code || ""}&courseClassesNumber=${course.classes_number || ""}`)}
          >
            <Plus size={16} />
            Programar Nueva Edición
          </Button>
        </div>

        <Card className="shadow-sm border-border/60 overflow-hidden">
          {(!course.editions || course.editions.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-muted/10">
              <div className="bg-muted p-5 rounded-full mb-5 shadow-inner">
                <CalendarIcon className="h-10 w-10 text-muted-foreground/50 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1.5">
                Este curso no tiene ediciones programadas.
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm text-sm">
                ¡Comienza programando la primera apertura ahora mismo para dar inicio a las inscripciones!
              </p>
              <Button 
                className="gap-2 rounded-full px-6"
                onClick={() => navigate(`/admin/academic/editions/nuevo?courseId=${course.id}&courseCode=${course.code || ""}&courseClassesNumber=${course.classes_number || ""}`)}
              >
                <Plus size={16} />
                Programar la Primera Edición
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-muted-foreground pl-6">Nro. Edición</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Fecha de Inicio</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Fecha de Finalización</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Modalidad</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Estado</TableHead>
                  <TableHead className="font-semibold text-muted-foreground text-right pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {course?.editions?.map((edition: any) => (
                  <TableRow key={edition.id} className="group transition-colors hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground pl-6">
                      <span className="bg-muted/50 px-2 py-1 rounded-md border border-border/40 font-mono text-sm">
                        {edition.edition_number || "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2 whitespace-nowrap text-sm">
                        <CalendarIcon size={14} className="text-muted-foreground/60" />
                        <span>
                          {edition.start_date ? actions.adjustDateTz(edition.start_date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "TBD"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-2 whitespace-nowrap text-sm">
                        <CalendarIcon size={14} className="text-muted-foreground/60" />
                        <span>
                          {edition.end_date ? actions.adjustDateTz(edition.end_date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "TBD"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-muted/20 text-muted-foreground hover:bg-muted/40 font-medium">
                        <MapPin className="mr-1.5 h-3 w-3 opacity-70" />
                        {translateEnum(edition.modality?.name || edition.modality, ModalityMap)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          edition.edition_status === "OPEN" || edition.edition_status === "IN_PROGRESS"
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-transparent shadow-none"
                            : edition.edition_status === "SCHEDULED"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100 border-transparent shadow-none"
                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-transparent shadow-none"
                        }
                      >
                        {translateEnum(edition.edition_status, EditionStatusMap)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors opacity-70 group-hover:opacity-100">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/academic/editions/${edition.id}`)} className="gap-2 cursor-pointer">
                            <Eye size={15} className="text-muted-foreground" />
                            <span>Ver Detalle</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/admin/academic/editions/${edition.id}/editar`)} className="gap-2 cursor-pointer">
                            <Edit size={15} className="text-muted-foreground" />
                            <span>Editar Edición</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => actions.openDelete(edition.id)} 
                            className="gap-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                          >
                            <Trash size={15} />
                            <span>Eliminar</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      

      <AlertDialog open={modals.showDeleteAlert} onOpenChange={modals.setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar esta edición?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la edición y toda la información asociada a ella.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteIsPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={actions.confirmDelete}
              disabled={deleteIsPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteIsPending ? "Eliminando..." : "Sí, eliminar edición"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
