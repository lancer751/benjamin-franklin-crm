import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Loader2, MoreVertical, LayoutGrid, List } from "lucide-react";
import { Card } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/core/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/core/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/core/components/ui/tabs";

// Componentes importados
import CourseFormModal from "../components/CourseFormModal";
import EditionFormModal from "../components/EditionFormModal";

// 🧠 Importamos el hook
import { useCoursesAdminView } from "../hooks/useCoursesAdminView";

export default function CoursesAdminView() {
  const navigate = useNavigate();
  const {
    isLoading, isError, filteredCourses, viewMode, modals, isDeleting,
    getInitials, setViewMode, setShowEditionForm, setShowDeleteAlert,
    handleOpenCourseForm, handleCloseCourseForm, handleOpenDeleteAlert, confirmDelete
  } = useCoursesAdminView();

  const [activeType, setActiveType] = useState<"ALL" | "COURSE" | "PROGRAM">("ALL");

  const displayedCourses = activeType === "ALL" 
    ? filteredCourses 
    : filteredCourses.filter((c: any) => c.type === activeType);

  return (
    <div className="flex flex-col gap-6 w-full fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Catálogo Académico</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión centralizada de programas y cursos master.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Selector de Vista (Grid / Tabla) */}
          <div className="flex items-center bg-muted/40 p-1 rounded-lg border border-border/50">
            <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" className="h-8 px-2 shadow-none" onClick={() => setViewMode("grid")}>
              <LayoutGrid size={16} className={viewMode === "grid" ? "text-foreground" : "text-muted-foreground"} />
            </Button>
            <Button variant={viewMode === "table" ? "secondary" : "ghost"} size="sm" className="h-8 px-2 shadow-none" onClick={() => setViewMode("table")}>
              <List size={16} className={viewMode === "table" ? "text-foreground" : "text-muted-foreground"} />
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center gap-2 shadow-sm rounded-lg bg-primary text-primary-foreground">
                <BookOpen size={16} /> Nuevo Registro
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenCourseForm()}>Nuevo Curso/Programa</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowEditionForm(true)}>Programar Edición</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
          <p className="text-lg">Cargando catálogo desde el servidor...</p>
        </div>
      ) : isError ? (
        <Card className="shadow-sm border-border/60 overflow-hidden">
          <div className="flex flex-col items-center justify-center py-20 text-destructive">
            <p className="font-bold">Error al cargar los cursos. Verifica la conexión con el backend.</p>
          </div>
        </Card>
      ) : (
        <div className="mt-2 flex flex-col gap-6">
          <Tabs value={activeType} onValueChange={(val: any) => setActiveType(val)} className="w-full">
            <TabsList className="bg-muted/40 border border-border/50 p-1">
              <TabsTrigger value="ALL" className="data-[state=active]:bg-background">Todos</TabsTrigger>
              <TabsTrigger value="COURSE" className="data-[state=active]:bg-background">Cursos de Especialización</TabsTrigger>
              <TabsTrigger value="PROGRAM" className="data-[state=active]:bg-background">Programas de Especialización</TabsTrigger>
            </TabsList>
          </Tabs>

          {viewMode === "grid" ? (
            /* =========== VISTA GRID =========== */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedCourses.length === 0 ? (
                <div className="col-span-full py-20 text-center text-muted-foreground bg-muted/20 border border-dashed rounded-xl">
                  No hay cursos master registrados en el sistema.
                </div>
              ) : (
                displayedCourses.map((course: any) => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-md transition-all group cursor-pointer relative flex flex-col border-border/60" onClick={() => navigate(`/admin/cursos/${course.id}`)}>
                    <div className="aspect-video w-full bg-muted/40 relative overflow-hidden flex items-center justify-center">
                      {course.image_url ? (
                        <img src={course.image_url} alt={course.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary/15 transition-colors">
                          <span className="text-5xl font-bold text-primary/20 tracking-wider select-none">{getInitials(course.name)}</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/90 hover:bg-background text-foreground shadow-sm">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/admin/cursos/${course.id}`)}>Ver Detalles</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleOpenCourseForm(course)}>Editar Curso</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onClick={() => handleOpenDeleteAlert(course)}>
                              Eliminar Curso
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="mb-3">
                        <Badge variant="outline" className="font-semibold text-muted-foreground bg-muted/30 border-border/60 mb-2">{course.code || "N/A"}</Badge>
                        <h3 className="font-semibold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">{course.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-auto">{course.description || "Este curso no tiene una descripción detallada por el momento."}</p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          ) : (
            /* =========== VISTA TABLA =========== */
            <Card className="shadow-sm border-border/60 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-muted-foreground w-[120px]">Código</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Nombre del Curso</TableHead>
                    <TableHead className="font-semibold text-muted-foreground hidden md:table-cell">Descripción</TableHead>
                    <TableHead className="font-semibold text-muted-foreground w-[80px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedCourses.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No hay cursos master registrados.</TableCell></TableRow>
                  ) : (
                    displayedCourses.map((course: any) => (
                      <TableRow key={course.id} className="group transition-colors cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/admin/cursos/${course.id}`)}>
                        <TableCell><Badge variant="outline" className="font-semibold text-muted-foreground bg-muted/30 border-border/60">{course.code || "N/A"}</Badge></TableCell>
                        <TableCell className="font-medium text-foreground">{course.name}</TableCell>
                        <TableCell className="text-muted-foreground text-sm max-w-[300px] truncate hidden md:table-cell" title={course.description}>{course.description || "Sin descripción"}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical size={18} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={() => navigate(`/admin/cursos/${course.id}`)}>Ver Detalles</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleOpenCourseForm(course)}>Editar Curso</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground" onClick={() => handleOpenDeleteAlert(course)}>
                                Eliminar Curso
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      )}

      {/* Modales */}
      <CourseFormModal open={modals.showCourseForm} onClose={handleCloseCourseForm} initialData={modals.selectedCourse} />
      <EditionFormModal open={modals.showEditionForm} onClose={() => setShowEditionForm(false)} />

      <AlertDialog open={modals.showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar curso master?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar permanentemente el curso <b>{modals.selectedCourse?.name || modals.selectedCourse?.code}</b>. 
              Esta acción no se puede deshacer y podría afectar las ediciones históricas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? "Eliminando..." : "Sí, eliminar curso"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}