import { useState, useEffect } from "react";
import { Plus, MoreVertical, ChevronLeft, ChevronRight, Eye, Edit, Trash2, Loader2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProspectForm from "@/leads/components/ProspectForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllLeads, deleteLead } from "../services/leadService";
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

const stageColors: Record<string, string> = {
  Prospecto: "bg-blue-100 text-blue-700",
  Interesado: "bg-yellow-100 text-yellow-700",
  Cliente: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-blue-100 text-blue-700",
  CONTACTED: "bg-yellow-100 text-yellow-700",
  CONVERTED: "bg-emerald-100 text-emerald-700",
};

const ProspectsView = () => {
  const [showForm, setShowForm] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<any>(null);
  const [leadToDelete, setLeadToDelete] = useState<any>(null);

  // Estados de Filtros
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [genderFilter, setGenderFilter] = useState("ALL");

  // Estados de Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Fetching de la base de datos
  const { data: leadsRes, isLoading, isError } = useQuery({
    queryKey: ["leads"],
    queryFn: getAllLeads,
  });

  const leads = Array.isArray(leadsRes) ? leadsRes : (leadsRes as any)?.data || [];

  // 2. Lógica de Filtrado
  const filteredLeads = leads.filter((lead: any) => {
    const matchStatus = statusFilter === "ALL" || lead.lead_status === statusFilter;
    const matchGender = genderFilter === "ALL" || lead.gender === genderFilter;
    return matchStatus && matchGender;
  });

  // Resetear a página 1 si los filtros cambian
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, genderFilter]);

  // 3. Lógica de Paginación
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLead(id),
    onSuccess: () => {
      toast.success("Prospecto eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setLeadToDelete(null);
      // Ajustar la paginación si se elimina el último elemento de la página
      if (paginatedLeads.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    },
    onError: () => {
      toast.error("Error al eliminar el prospecto");
      setLeadToDelete(null);
    }
  });

  const handleEdit = (lead: any) => {
    setLeadToEdit(lead);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
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
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus size={18} /> Nuevo Prospecto
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-end gap-4 rounded-xl bg-card p-5 border border-border">
        {/* Usamos el espacio de campaña para otra cosa o lo dejamos estático por ahora */}
        <div className="flex-1">
          <label className="form-label">Campaña</label>
          <select className="form-select" disabled>
            <option>Todas las Campañas</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="form-label">Estado</label>
          <select 
            className="form-select" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">Cualquier Estado</option>
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="form-label">Género</label>
          <select 
            className="form-select"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="ALL">Todos los Géneros</option>
            <option value="MALE">Masculino</option>
            <option value="FEMALE">Femenino</option>
            <option value="NOT_SPECIFIED">No especificado</option>
          </select>
        </div>
        <button 
          className="btn-secondary whitespace-nowrap"
          onClick={() => {
            setStatusFilter("ALL");
            setGenderFilter("ALL");
            setCurrentPage(1);
          }}
        >
          Limpiar Filtros
        </button>
      </div>

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
        ) : leads.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
             <Users className="h-12 w-12 mb-4 opacity-20" />
             <p>No hay prospectos registrados aún.</p>
           </div>
        ) : filteredLeads.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
             <Users className="h-12 w-12 mb-4 opacity-20" />
             <p>No se encontraron prospectos con estos filtros.</p>
           </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Nombre Completo</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Contacto</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">DNI</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Género</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Etapa</th>
                  <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeads.map((p: any) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                          {p.first_name?.[0] || ""}{p.last_name?.[0] || ""}
                        </div>
                        <span className="font-medium text-foreground">{p.first_name} {p.last_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-foreground">{p.email}</div>
                    </td>
                    <td className="px-6 py-4 text-foreground">{p.dni || "-"}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {p.gender === "MALE" ? "Masculino" : p.gender === "FEMALE" ? "Femenino" : "N/E"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold tracking-wide ${stageColors[p.status || "Prospecto"] || "bg-muted text-muted-foreground"}`}>
                        {p.status || "Prospecto"}
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
                          <DropdownMenuItem onClick={() => navigate(`/prospectos/${p.id}`)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(p)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setLeadToDelete(p)} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
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
            <div className="flex items-center justify-between border-t border-border px-6 py-3 bg-muted/20">
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
            </div>
          </>
        )}
      </div>

      <ProspectForm 
        key={leadToEdit ? leadToEdit.id : 'new-lead'} 
        open={showForm} 
        onClose={handleCloseForm} 
        initialData={leadToEdit} 
      />

      {/* Diálogo de Confirmación para Eliminar */}
      <AlertDialog open={!!leadToDelete} onOpenChange={(open) => !open && setLeadToDelete(null)}>
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
      </AlertDialog>

    </div>
  );
};

export default ProspectsView;
