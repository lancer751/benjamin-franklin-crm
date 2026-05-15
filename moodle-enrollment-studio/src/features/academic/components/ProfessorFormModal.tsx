import { ModalWrapper } from "@/core/components/modals/ModalWrapper";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/core/components/ui/form";
import { Input } from "@/core/components/ui/input";
import { useProfessorFormModal } from "../hooks/useProfessorFormModal";

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
        <form id="professor-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        </form>
      </Form>
    </ModalWrapper>
  );
};
