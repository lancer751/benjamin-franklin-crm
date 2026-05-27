import { ModalWrapper } from "@/core/components/modals/ModalWrapper";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { useProfessorFormModal } from "../hooks/useProfessorFormModal";
import { Button } from "@/core/components/ui/button";
import { Loader2 } from "lucide-react";

interface ProfessorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  professor?: any | null;
}

export const ProfessorFormModal = ({ isOpen, onClose, professor }: ProfessorFormModalProps) => {
  const { form, isPending, closeAndReset, onSubmit, isLoadingProfessor } = useProfessorFormModal(
    isOpen,
    onClose,
    professor
  );

  return (
    <ModalWrapper
      open={isOpen}
      onClose={closeAndReset}
      title={professor ? "Editar Docente" : "Nuevo Docente"}
      subtitle={professor ? "Modifica los datos del docente." : "Ingresa los datos para registrar un nuevo docente en el sistema."}
      maxWidth="max-w-3xl"
    >
      <Form {...form}>
        <form id="professor-form" onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
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
                name="lastname"
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
                    <FormLabel>Email Personal</FormLabel>
                    <FormControl>
                      <Input placeholder="ejemplo@correo.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="corporate_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Corporativo (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="ejemplo@empresa.com" type="email" {...field} value={field.value || ""} />
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
                    <FormLabel>Celular</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. 987654321" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="moddle_account_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Moodle</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. 123" type="number" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="px-6 py-4 border-t border-border/50 flex justify-end gap-3 bg-muted/20">
            <Button type="button" variant="outline" onClick={closeAndReset}>Cancelar</Button>
            <Button type="submit" disabled={isPending || isLoadingProfessor}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {professor ? "Guardar Cambios" : "Crear Docente"}
            </Button>
          </div>
        </form>
      </Form>
    </ModalWrapper>
  );
};
