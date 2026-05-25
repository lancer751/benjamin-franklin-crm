import { Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { FormProvider } from "react-hook-form";
import {
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

import { translateEnum, RoleTranslationsMap } from "@/core/utils/dictionaries";

import { BaseUserFields } from "./BaseUserFields";
import { SellerFields } from "./SellerFields";
import { SupervisorFields } from "./SupervisorFields";

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
    isLoadingDetails,
    closeAndReset,
    onSubmit,
  } = useUserFormModal(isOpen, onClose, user);

  // Determinamos si es supervisor basado en el rol seleccionado
  const roleId = form.watch("role_id");
  const isSupervisor = roles?.find((r: any) => r.id === roleId)?.name === "SALES_SUPERVISOR";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAndReset()}>
      <DialogContent className="sm:max-w-[600px] flex flex-col max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
          <DialogTitle>{user ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
            
            {/* Cuerpo del Modal (Área de Scroll) */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {isLoadingDetails ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-3 text-primary" />
                  <p className="text-sm font-semibold text-slate-500 animate-pulse">Cargando datos del perfil...</p>
                </div>
              ) : (
                <>
                  <BaseUserFields roles={roles} loadingRoles={loadingRoles} isEditMode={!!user} />

                  <SellerFields 
                    supervisors={supervisors} 
                    loadingSupervisors={loadingSupervisors} 
                    isVisible={isSeller} 
                  />

                  <SupervisorFields isVisible={isSupervisor} />
                </>
              )}
            </div>

            {/* Footer Fijo */}
            <div className="shrink-0 bg-background border-t p-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeAndReset}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending || isLoadingDetails}>
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
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}