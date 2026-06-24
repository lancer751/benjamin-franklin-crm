import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader2, Edit, Trash2, GraduationCap, Eye } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/core/components/ui/alert-dialog";
import { CustomTable } from "@/core/components/CustomTable";
import { ProfessorFormModal } from "../components/ProfessorFormModal";
import { useProfessorsView } from "../hooks/useProfessorsView";

export default function ProfessorsView() {
  const navigate = useNavigate();
  const {
    isLoading,
    isError,
    professors,
    modal,
    deleteAlert,
    setProfessorToDelete,
    handleOpenModal,
    handleCloseModal,
    handleDeleteConfirm,
  } = useProfessorsView();

  // Columnas tipadas y preparadas con soporte nativo para responsive CustomTable
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "Nombre Completo",
        accessorKey: "name",
        cell: ({ row }) => {
          const p = row.original;
          return `${p.name?.trim() || ""} ${p.lastname?.trim() || ""}`.trim();
        },
      },
      {
        header: "Correo Corporativo",
        accessorKey: "corporate_email",
        cell: ({ row }) => row.original.corporate_email || "-",
      },
      {
        header: "Celular",
        accessorKey: "cellphone",
        cell: ({ row }) => row.original.cellphone || "-",
      },
      {
        header: "Estado Moodle",
        accessorKey: "moodle_user_status",
        cell: ({ row }) => {
          const status = row.original.moodle_user_status;
          if (status === "ACTIVE") {
            return (
              <Badge className="bg-emerald-100 text-emerald-800 border-transparent hover:bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold rounded-lg shadow-sm">
                Activo
              </Badge>
            );
          }
          return (
            <Badge className="bg-rose-100 text-rose-800 border-transparent hover:bg-rose-100 px-2.5 py-0.5 text-xs font-semibold rounded-lg shadow-sm">
              Suspendido
            </Badge>
          );
        },
      },
      {
        header: "Acciones",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/profesores/${p.id}`);
                }}
                title="Ver Detalle"
              >
                <Eye size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(p);
                }}
                title="Editar"
              >
                <Edit size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setProfessorToDelete(p.id);
                }}
                title="Eliminar"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          );
        },
      },
    ],
    [handleOpenModal, setProfessorToDelete]
  );

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
      <Card className="shadow-sm border-border/60 overflow-hidden flex flex-col p-6 bg-white rounded-xl">
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
          <CustomTable data={professors} columns={columns} />
        )}
      </Card>

      {/* Modales */}
      <ProfessorFormModal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        professor={modal.selectedProfessor}
      />



      <AlertDialog
        open={deleteAlert.isOpen}
        onOpenChange={(open) => {
          if (!open) setProfessorToDelete(null);
        }}
      >
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
              {deleteAlert.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sí, eliminar docente"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
