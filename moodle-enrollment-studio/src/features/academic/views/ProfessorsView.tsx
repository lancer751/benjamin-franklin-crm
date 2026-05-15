import { Plus, Loader2, Edit, Trash2, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/core/components/ui/table";
import { Card } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/core/components/ui/alert-dialog";
import { ProfessorFormModal } from "../components/ProfessorFormModal";
import { useProfessorsView } from "../hooks/useProfessorsView";

export default function ProfessorsView() {
  const {
    isLoading, isError, professors, totalFiltered, pagination, modal, deleteAlert,
    setCurrentPage, setProfessorToDelete, handleOpenModal, handleCloseModal, handleDeleteConfirm
  } = useProfessorsView();

  return (
    <div className="flex flex-col gap-6 w-full fade-in">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestión de Docentes</h1>
        <Button 
          className="flex items-center gap-2 shadow-sm rounded-lg"
          onClick={() => handleOpenModal()}
        >
          <Plus size={16} />
          Nuevo Docente
        </Button>
      </div>

      {/* Table Section */}
      <Card className="shadow-sm border-border/60 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p>Cargando docentes...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-destructive">
            <p className="font-bold">Error al conectar con el servidor.</p>
          </div>
        ) : professors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mb-4 opacity-20" />
            <p>No hay docentes registrados.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-muted-foreground">Nombre Completo</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Email</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Celular</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">ID Moodle</TableHead>
                  <TableHead className="w-[140px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {professors.map((professor: any) => (
                  <TableRow key={professor.id} className="group transition-colors">
                    <TableCell className="font-medium text-foreground">
                      {professor.name} {professor.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{professor.email}</TableCell>
                    <TableCell className="text-muted-foreground">{professor.cellphone || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{professor.moddle_account_id || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={(e) => { e.stopPropagation(); handleOpenModal(professor); }}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => { e.stopPropagation(); setProfessorToDelete(professor.id); }}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination Footer */}
            <div className="border-t border-border/60 p-4 flex items-center justify-between bg-card text-sm text-muted-foreground mt-auto">
              <div>
                Mostrando {Math.min((pagination.currentPage - 1) * pagination.itemsPerPage + 1, totalFiltered)} a {Math.min(pagination.currentPage * pagination.itemsPerPage, totalFiltered)} de {totalFiltered} registros
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={pagination.currentPage === 1}
                >
                  <ChevronLeft size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={pagination.currentPage * pagination.itemsPerPage >= totalFiltered}
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Modales */}
      <ProfessorFormModal 
        isOpen={modal.isOpen} 
        onClose={handleCloseModal} 
        professor={modal.selectedProfessor} 
      />

      <AlertDialog open={deleteAlert.isOpen} onOpenChange={(open) => { if (!open) setProfessorToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar docente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer y borrará permanentemente los datos del docente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAlert.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={deleteAlert.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAlert.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sí, eliminar docente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
