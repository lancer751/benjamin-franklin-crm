import { Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/core/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/core/components/ui/select";
import { Input } from "@/core/components/ui/input";
import { Button } from "@/core/components/ui/button";
import { Switch } from "@/core/components/ui/switch";

const ROLE_TRANSLATIONS: Record<string, string> = {
  ADMIN: "Administrador",
  MARKETING: "Marketing",
  SALES_SUPERVISOR: "Supervisor de Ventas",
  SALES_REP: "Asesor de Ventas",
  COLLECTIONS: "Cobranzas",
};

// 🧠 Importamos el hook que acabamos de crear
import { useUserFormModal } from "../hooks/useUserForm";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any | null;
}

export function UserFormModal({ isOpen, onClose, user }: UserFormModalProps) {
  // Extraemos toda la lógica y los estados de nuestro Custom Hook
  const {
    form,
    roles,
    supervisors,
    loadingRoles,
    loadingSupervisors,
    isSeller,
    isPending,
    closeAndReset,
    onSubmit,
  } = useUserFormModal(isOpen, onClose, user);

  // Determinamos si es supervisor basado en el rol seleccionado
  const watchRoleId = form.watch("role_id");
  const isSupervisor = roles?.find((r: any) => r.id === watchRoleId)?.name === "SALES_SUPERVISOR";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAndReset()}>
      <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
          <DialogTitle>{user ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            
            {/* Cuerpo del Modal (Área de Scroll) */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Juan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="correo@ejemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{user ? "Nueva Contraseña (Opcional)" : "Contraseña *"}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cellphone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Celular (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol de Usuario</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingRoles ? "Cargando roles..." : "Selecciona un rol"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role: any) => (
                            <SelectItem key={role.id} value={role.id}>
                              {ROLE_TRANSLATIONS[role.name] || role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm md:col-span-2">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Estado del Usuario
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Activa o inactiva el acceso de este usuario al sistema.
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Sección de Datos Vendedor Animada */}
              <div 
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  isSeller ? "opacity-100 max-h-[600px] mt-4" : "opacity-0 max-h-0 m-0"
                }`}
              >
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <span>📊</span> Datos de Vendedor
                  </h3>

                  {isSeller && !loadingSupervisors && supervisors.length === 0 && (
                    <Alert variant="destructive" className="mb-4 bg-destructive/10 text-destructive border-destructive/20">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Debe registrar un supervisor antes de crear un vendedor.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="sales_target"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta de Ventas ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="assigned_supervisor_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supervisor Asignado</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={loadingSupervisors || supervisors.length === 0}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={loadingSupervisors ? "Cargando..." : "Selecciona supervisor"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {supervisors.map((sup: any) => (
                                <SelectItem key={sup.id} value={sup.id}>
                                  {sup.user?.first_name} {sup.user?.last_name} {sup.team_name ? `(${sup.team_name})` : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Sección de Datos Supervisor Animada */}
              <div 
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  isSupervisor ? "opacity-100 max-h-[800px] mt-4" : "opacity-0 max-h-0 m-0"
                }`}
              >
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <span>👑</span> Datos de Supervisor
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormField
                      control={form.control}
                      name="team_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Equipo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej. Ventas Norte" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="max_sellers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Límite Vendedores</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="discount_limit_percent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Límite Descuento (%)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" min="0" max="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Permisos de Supervisor</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="can_assign_leads"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Asignar Leads</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="can_approve_discounts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Aprobar Descuentos</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="can_reassign_leads"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Reasignar Leads</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="can_cancel_orders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Cancelar Órdenes</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="can_view_all_team_sales"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background sm:col-span-2">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Ver Ventas de Todo el Equipo</FormLabel>
                          </div>
                          <FormControl>
                            <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Fijo */}
            <div className="shrink-0 bg-background border-t p-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeAndReset}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  user ? "Actualizar Usuario" : "Crear Usuario"
                )}
              </Button>
            </div>
            
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}