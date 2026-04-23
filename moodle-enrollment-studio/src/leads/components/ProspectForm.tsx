import { useEffect } from "react";
import { Contact, Loader2 } from "lucide-react";
import ModalWrapper from "@/core/components/ModalWrapper";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createLead, updateLead } from "../services/leadService";
import { toast } from "sonner";
import { Label } from "@/core/components/ui/label";
import { Input } from "@/core/components/ui/input";
import { Button } from "@/core/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";

const leadSchema = z.object({
  first_name: z.string().min(1, "Requerido"),
  last_name: z.string().min(1, "Requerido"),
  middle_name: z.string().min(1, "Requerido"),
  email: z.string().email("Email inválido"),
  dni: z.string().regex(/^\d{8}$/, "Debe tener 8 dígitos").optional().or(z.literal("")),
  profession: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "NOT_SPECIFIED"]),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface ProspectFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: any;
}

const ProspectForm = ({ open, onClose, initialData }: ProspectFormProps) => {
  const isEdit = !!initialData;
  const queryClient = useQueryClient();

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      middle_name: "",
      email: "",
      dni: "",
      profession: "",
      gender: "NOT_SPECIFIED",
    },
  });

  const { control, handleSubmit, reset, formState: { errors } } = form;

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          first_name: initialData.first_name || "",
          last_name: initialData.last_name || "",
          middle_name: initialData.middle_name || "",
          email: initialData.email || "",
          dni: initialData.dni || "",
          profession: initialData.profession || "",
          gender: initialData.gender || "NOT_SPECIFIED",
        });
      } else {
        reset({
          first_name: "",
          last_name: "",
          middle_name: "",
          email: "",
          dni: "",
          profession: "",
          gender: "NOT_SPECIFIED",
        });
      }
    }
  }, [open, initialData, reset]);

  const mutation = useMutation({
    mutationFn: (data: LeadFormValues) => {
      // Si dni o profession vienen como string vacío, convertirlos a undefined o dejarlos (depende del backend,
      // pero el schema los soporta como strings).
      const payload = {
        ...data,
        dni: data.dni?.trim() ? data.dni.trim() : undefined,
        profession: data.profession?.trim() ? data.profession.trim() : undefined,
      };

      if (initialData?.id) {
        return updateLead(initialData.id, payload as any);
      }
      return createLead(payload as any);
    },
    onSuccess: () => {
      toast.success(`Prospecto ${isEdit ? "actualizado" : "creado"} correctamente`);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      onClose();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Ocurrió un error al guardar el prospecto. Verifique los datos.");
    }
  });

  const onSubmit = (data: LeadFormValues) => {
    mutation.mutate(data);
  };

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={isEdit ? "Editar Prospecto" : "Nuevo Prospecto"}
      subtitle="Registra la información del interesado."
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Actualizar" : "Guardar Prospecto"}
          </Button>
        </>
      }
    >
      <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
        {/* Datos Personales */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2 text-primary font-semibold">
            <Contact size={18} />
            <span>Datos Personales</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Nombres</Label>
              <Controller
                control={control}
                name="first_name"
                render={({ field }) => (
                  <Input placeholder="Ej: Ricardo Javier" {...field} className={errors.first_name ? "border-destructive" : ""} />
                )}
              />
              {errors.first_name && <span className="text-xs text-destructive">{errors.first_name.message}</span>}
            </div>
            <div className="space-y-1">
              <Label>Apellido Paterno</Label>
              <Controller
                control={control}
                name="last_name"
                render={({ field }) => (
                  <Input placeholder="Ej: Mendoza" {...field} className={errors.last_name ? "border-destructive" : ""} />
                )}
              />
              {errors.last_name && <span className="text-xs text-destructive">{errors.last_name.message}</span>}
            </div>
            <div className="space-y-1">
              <Label>Apellido Materno</Label>
              <Controller
                control={control}
                name="middle_name"
                render={({ field }) => (
                  <Input placeholder="Ej: Salazar" {...field} className={errors.middle_name ? "border-destructive" : ""} />
                )}
              />
              {errors.middle_name && <span className="text-xs text-destructive">{errors.middle_name.message}</span>}
            </div>
            <div className="space-y-1">
              <Label>DNI (Opcional)</Label>
              <Controller
                control={control}
                name="dni"
                render={({ field }) => (
                  <Input placeholder="8 dígitos" maxLength={8} {...field} className={errors.dni ? "border-destructive" : ""} />
                )}
              />
              {errors.dni && <span className="text-xs text-destructive">{errors.dni.message}</span>}
            </div>
          </div>
        </div>

        {/* Contacto & Clasificación */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2 text-primary font-semibold">
            <Contact size={18} />
            <span>Contacto y Clasificación</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Email Principal</Label>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <Input type="email" placeholder="nombre@ejemplo.com" {...field} className={errors.email ? "border-destructive" : ""} />
                )}
              />
              {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
            </div>
            
            <div className="space-y-1">
              <Label>Profesión (Opcional)</Label>
              <Controller
                control={control}
                name="profession"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar profesión" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ingeniero">Ingeniero</SelectItem>
                      <SelectItem value="abogado">Abogado</SelectItem>
                      <SelectItem value="medico">Médico</SelectItem>
                      <SelectItem value="contador">Contador</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1">
              <Label>Género</Label>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={errors.gender ? "border-destructive" : ""}>
                      <SelectValue placeholder="Seleccionar género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Masculino</SelectItem>
                      <SelectItem value="FEMALE">Femenino</SelectItem>
                      <SelectItem value="NOT_SPECIFIED">No Especificado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gender && <span className="text-xs text-destructive">{errors.gender.message}</span>}
            </div>
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default ProspectForm;
