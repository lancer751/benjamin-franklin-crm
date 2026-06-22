import { useState, useEffect } from "react";
import { Plus, MoreVertical, ChevronLeft, ChevronRight, Eye, Edit, Trash2, Loader2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LeadFormModal from "../components/LeadFormModal";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { filterLeadsParams, getAllLeads, PaginatedLeads, type GetAllLeadsRes } from "../services/leadService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/core/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import { LeadFilters } from "../components/LeadFilters";

const stageColors: Record<string, string> = {
  INACTIVE: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
};

const ProspectsView = () => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<PaginatedLeads["leads"][number] | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<PaginatedLeads["leads"][number] | null>(null);
  // Estados de Filtros
  const [filters, setFilters] = useState<filterLeadsParams>({
    page: 1,
    limit: 20,
    search: "",
    status: "ACTIVE"
  })

  const [searchInput, setSearchInput] = useState("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Fetching — filters está DENTRO del queryKey, por eso refetchea solo
  const { data, isLoading, isError, isPlaceholderData } = useQuery({
    queryKey: ["leads", filters],
    queryFn: () => getAllLeads(filters),
    placeholderData: keepPreviousData
  });

  // const deleteMutation = useMutation({
  //   mutationFn: (id: string) => deleteLead(id),
  //   onSuccess: () => {
  //     toast.success("Prospecto eliminado correctamente");
  //     queryClient.invalidateQueries({ queryKey: ["leads"] });
  //     setLeadToDelete(null);
  //     // Ajustar la paginación si se elimina el último elemento de la página
  //     if (paginatedLeads.length === 1 && currentPage > 1) {
  //       setCurrentPage(currentPage - 1);
  //     }
  //   },
  //   onError: () => {
  //     toast.error("Error al eliminar el prospecto");
  //     setLeadToDelete(null);
  //   }
  // });

  const handleEdit = (lead: PaginatedLeads["leads"][number]) => {
    setLeadToEdit(lead);
    setIsLeadModalOpen(true);
  };

  const handleCloseForm = () => {
    setIsLeadModalOpen(false);
    setTimeout(() => setLeadToEdit(null), 300);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Prospectos</h1>
          <p className="text-sm text-muted-foreground mt-1">Administra y da seguimiento a los leads de inscripción.</p>
        </div>
        <button onClick={() => setIsLeadModalOpen(true)} className="btn-primary">
          <Plus size={18} /> Nuevo Prospecto
        </button>
      </div>

      {/* Filters */}
      <LeadFilters filters={filters} setFilters={setFilters} searchInput={searchInput} setSearchInput={setSearchInput}/>

      {/* Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        {isLoading ? (
           <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
             <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
             <p>Cargando prospectos...</p>
           </div>
        ) : isError ? (
           <div className="flex flex-col items-center justify-center py-20 text-destructive">
             <p className="font-bold">Error al conectar con el servidor.</p>
           </div>
        ) : data.leads.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
             <Users className="h-12 w-12 mb-4 opacity-20" />
             <p>No hay prospectos registrados aún.</p>
           </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nombre Completo</th>
                   <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nro Celular</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Correo Electrónico</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Estado</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {data.leads.map((lead: PaginatedLeads["leads"][number]) => (
                  <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                          {lead.first_name?.[0] || ""}{lead.last_name?.[0] || ""}
                        </div>
                        <span className="font-medium text-foreground">{lead.first_name} {lead.last_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-foreground">{lead.phones[0].number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-foreground">{lead.email.toLocaleLowerCase()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide ${stageColors[lead.lead_status]}`}>
                        {lead.lead_status === "ACTIVE" ? "Activo" : lead.lead_status === "INACTIVE" ? "Inactivo" : lead.lead_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => navigate(`/prospectos/${lead.id}`)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(lead)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setLeadToDelete(lead)} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"> 
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Footer con Paginación */}
            {/* <div className="flex items-center justify-between border-t border-border px-6 py-3 bg-muted/20">
              <span className="text-sm text-muted-foreground">
                Mostrando {paginatedLeads.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, filteredLeads.length)} de {filteredLeads.length} prospectos
              </span>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button className="h-8 w-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {currentPage}
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="h-8 w-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div> */}
          </>
        )}
      </div>

      <LeadFormModal 
        open={isLeadModalOpen} 
        onClose={handleCloseForm} 
        leadId={leadToEdit?.id || null} 
      />

      {/* Diálogo de Confirmación para Eliminar */}
      {/* <AlertDialog open={!!leadToDelete} onOpenChange={(open) => !open && setLeadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar prospecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar permanentemente a <strong>{leadToDelete?.first_name} {leadToDelete?.last_name}</strong>. 
              Esta acción no se puede deshacer y borrará toda la información asociada a este lead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                if (leadToDelete) deleteMutation.mutate(leadToDelete.id);
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sí, eliminar prospecto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}

    </div>
  );
};

export default ProspectsView;
