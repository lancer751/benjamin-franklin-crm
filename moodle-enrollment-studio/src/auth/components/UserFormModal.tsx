import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
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
    loadingRoles,
    isSeller,
    isPending,
    closeAndReset,
    onSubmit,
  } = useUserFormModal(isOpen, onClose, user);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAndReset()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col max-h-[85vh] overflow-hidden py-4 relative">
            
            {/* Cuerpo del Modal (Área de Scroll) */}
            <div className="flex-1 overflow-y-auto px-1 pb-4">
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
                  isSeller ? "opacity-100 max-h-[500px] mt-4" : "opacity-0 max-h-0 m-0"
                }`}
              >
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                    <span>📊</span> Datos de Vendedor
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
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
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Fijo */}
            <div className="shrink-0 bg-white pt-4 pb-2 border-t mt-2 flex justify-end gap-2">
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