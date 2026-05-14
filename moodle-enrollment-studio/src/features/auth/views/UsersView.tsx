import { useNavigate } from "react-router-dom";
import { MoreVertical, Plus, Users, UserCheck, Briefcase, Loader2, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/core/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Button } from "@/core/components/ui/button";
import { Badge } from "@/core/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/core/components/ui/alert-dialog";
import { UserFormModal } from "../components/UserFormModal";
import { useUsersView } from "../hooks/useUsersView";
import { translateEnum, RoleTranslationsMap } from "@/core/utils/dictionaries";

export default function UsersView() {
  const navigate = useNavigate();
  
  // lógica del Custom Hook
  const {
    isLoading, isError, users, totalFiltered, kpis, filters, pagination, modal, deleteAlert,
    setRoleFilter, setStatusFilter, setCurrentPage, setUserToDelete, handleOpenModal, handleCloseModal, handleDeleteConfirm
  } = useUsersView();

  return (
    <div className="flex flex-col gap-6 w-full fade-in">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestión de Usuarios</h1>
        <Button 
          className="flex items-center gap-2 shadow-sm rounded-lg"
          onClick={() => handleOpenModal()}
        >
          <Plus size={16} />
          Nuevo Usuario
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Usuarios</CardTitle>
            <div className="p-2 bg-primary/10 rounded-full"><Users size={16} className="text-primary" /></div>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-foreground">{isLoading ? "-" : kpis.totalUsers}</div></CardContent>
        </Card>
        
        <Card className="shadow-sm border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Usuarios Activos</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-full"><UserCheck size={16} className="text-emerald-600" /></div>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-foreground">{isLoading ? "-" : kpis.activeUsers}</div></CardContent>
        </Card>

        <Card 
          className="shadow-sm border-border/60 cursor-pointer transition-colors hover:bg-muted/50"
          onClick={() => setRoleFilter("SALES_REP")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vendedores</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-full"><Briefcase size={16} className="text-amber-600" /></div>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-foreground">{isLoading ? "-" : kpis.salesReps}</div></CardContent>
        </Card>
      </div>

      {/* Navegación por Tabs y Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full mb-6">
        <Tabs value={filters.roleFilter} onValueChange={setRoleFilter} className="w-full sm:w-auto">
          <TabsList className="flex items-center justify-start gap-2 bg-transparent h-auto p-0 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
            <TabsTrigger 
              value="ALL" 
              className="px-4 py-2 rounded-full border border-transparent data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted transition-all text-muted-foreground font-medium"
            >
              Todos
            </TabsTrigger>
            <TabsTrigger 
              value="ADMIN"
              className="px-4 py-2 rounded-full border border-transparent data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted transition-all text-muted-foreground font-medium"
            >
              Administradores
            </TabsTrigger>
            <TabsTrigger 
              value="SALES_REP"
              className="px-4 py-2 rounded-full border border-transparent data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted transition-all text-muted-foreground font-medium"
            >
              Asesores de Ventas
            </TabsTrigger>
            <TabsTrigger 
              value="MARKETING"
              className="px-4 py-2 rounded-full border border-transparent data-[state=active]:border-primary/20 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted transition-all text-muted-foreground font-medium"
            >
              Marketing
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Select value={filters.statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-card border-border/60 rounded-full h-10 px-4">
            <SelectValue placeholder="Estado..." />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/60">
            <SelectItem value="ALL">Todos los estados</SelectItem>
            <SelectItem value="ACTIVE">Usuarios Activos</SelectItem>
            <SelectItem value="INACTIVE">Usuarios Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Section */}
      <Card className="shadow-sm border-border/60 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
            <p>Cargando usuarios...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-destructive">
            <p className="font-bold">Error al conectar con el servidor.</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Users className="h-12 w-12 mb-4 opacity-20" />
            <p>No hay usuarios registrados en esta categoría.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-muted-foreground">Nombre</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Email</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Celular</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Rol</TableHead>
                  <TableHead className="font-semibold text-muted-foreground">Estado</TableHead>
                  <TableHead className="w-[140px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow key={user.id} className="group transition-colors">
                    <TableCell className="font-medium text-foreground">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="text-muted-foreground">{user.cellphone || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          user.role?.name === "ADMIN"
                            ? "border-red-200 text-red-700 bg-red-50/50 hover:bg-red-50/80"
                            : user.role?.name === "SALES_REP"
                            ? "border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-50/80"
                            : user.role?.name === "MARKETING"
                            ? "border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50/80"
                            : "border-gray-200 text-gray-700 bg-gray-50/50 hover:bg-gray-50/80"
                        }
                      >
                        {translateEnum(user.role?.name, RoleTranslationsMap)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          user.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-100 border-transparent shadow-none"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-100 border-transparent shadow-none"
                        }
                      >
                        {user.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                          onClick={(e) => { e.stopPropagation(); navigate(`/usuarios/${user.id}`); }}
                          title="Ver detalle"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                          onClick={(e) => { e.stopPropagation(); handleOpenModal(user); }}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => { e.stopPropagation(); setUserToDelete(user.id); }}
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
      <UserFormModal 
        isOpen={modal.isOpen} 
        onClose={handleCloseModal} 
        user={modal.selectedUser} 
      />

      <AlertDialog open={deleteAlert.isOpen} onOpenChange={(open) => { if (!open) setUserToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer y borrará permanentemente los datos del usuario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAlert.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={deleteAlert.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAlert.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sí, eliminar usuario"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}