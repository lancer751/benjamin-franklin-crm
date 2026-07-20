import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Loader2, UserCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  manualLeadSchema,
  type ManualLeadData,
  type ManualLeadFormInput,
} from "@/features/leads/schemas/manualLeadSchema";
import { useManualLeadLookup } from "@/features/leads/hooks/useManualLeadRegistration";

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ManualLeadData) => Promise<void>;
  isSubmitting: boolean;
  campaignId: string;
  sellerId?: string;
}

type FieldErrors = Partial<Record<keyof ManualLeadFormInput, string>>;

const emptyForm: ManualLeadFormInput = {
  first_name: "",
  last_name: "",
  email: "",
  cellphone: "",
};

export default function NewLeadModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  campaignId,
  sellerId,
}: NewLeadModalProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ManualLeadFormInput>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { lookup, isSearching, isLookupError, canLookup } = useManualLeadLookup(
    { cellphone: formData.cellphone, email: formData.email },
    campaignId,
    sellerId,
    isOpen,
  );

  const existingLead = lookup?.success && lookup.data?.found ? lookup.data.lead : null;
  const isAlreadyAssociated = Boolean(existingLead && lookup?.data?.campaign_member_id);
  const hasIdentityConflict = lookup?.code === "LEAD_IDENTITY_CONFLICT";
  const isNotFound = Boolean(lookup?.success && lookup.data && !lookup.data.found);
  const existingName = [existingLead?.first_name, existingLead?.last_name].filter(Boolean).join(" ") || "Prospecto sin nombre";
  const existingPhone = existingLead?.phones.find((phone) => phone.isPrincipal)?.number
    || existingLead?.phones[0]?.number;

  const resetForm = () => {
    setFormData(emptyForm);
    setFieldErrors({});
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as keyof ManualLeadFormInput;
    setFormData((previous) => ({ ...previous, [field]: event.target.value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const parsed = manualLeadSchema.safeParse(formData);

    if (!parsed.success) {
      const errors: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ManualLeadFormInput;
        if (field && !errors[field]) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    if (hasIdentityConflict) {
      toast.error("El celular y el correo pertenecen a prospectos diferentes. Verifica los datos.");
      return;
    }
    if (isAlreadyAssociated) {
      toast.info("Este prospecto ya está registrado en esta campaña.");
      return;
    }

    try {
      await onSubmit(parsed.data);
      resetForm();
    } catch {
      // El formulario permanece abierto para que el usuario corrija o reintente.
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const openExistingLead = () => {
    if (!existingLead?.id) return;
    handleClose();
    navigate(`/prospectos/${existingLead.id}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[480px] w-[95vw] rounded-xl p-6 bg-card border border-border shadow-2xl flex flex-col gap-4">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <UserPlus className="h-5 w-5 text-primary" /> Registrar Nuevo Lead
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Ingresa los datos para registrar o identificar al prospecto en esta campaña.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} noValidate className="space-y-4 pt-2">
          <div className="space-y-3">
            {([
              { name: "first_name", label: "Nombre", placeholder: "Ej. Juan", type: "text" },
              { name: "last_name", label: "Apellido", placeholder: "Ej. Pérez", type: "text" },
              { name: "email", label: "Email", placeholder: "ejemplo@correo.com", type: "email" },
            ] as const).map((field) => (
              <div key={field.name} className="space-y-1">
                <Label htmlFor={field.name} className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {field.label}
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="h-10 bg-slate-50/20 focus:bg-card border-border rounded-xl text-sm"
                  disabled={isSubmitting}
                />
                {fieldErrors[field.name] && <p className="text-xs text-destructive">{fieldErrors[field.name]}</p>}
              </div>
            ))}

            <div className="space-y-1">
              <Label htmlFor="cellphone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Celular <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cellphone"
                name="cellphone"
                type="tel"
                inputMode="numeric"
                value={formData.cellphone}
                onChange={handleChange}
                placeholder="Ej. 987654321"
                className="h-10 bg-slate-50/20 focus:bg-card border-border rounded-xl text-sm"
                disabled={isSubmitting}
                required
              />
              {fieldErrors.cellphone && <p className="text-xs text-destructive">{fieldErrors.cellphone}</p>}
            </div>
          </div>

          {isSearching && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Buscando prospecto…
            </div>
          )}

          {!isSearching && isNotFound && (
            <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-muted-foreground">
              No encontramos un prospecto registrado con estos datos.
            </p>
          )}

          {!isSearching && existingLead && (
            <div className={`rounded-xl border p-3 ${isAlreadyAssociated ? "border-amber-200 bg-amber-50" : "border-blue-200 bg-blue-50"}`}>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <UserCheck className="h-4 w-4" /> Prospecto existente
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-800">{existingName}</p>
              {existingPhone && <p className="mt-1 text-xs text-slate-600">Celular: {existingPhone}</p>}
              {existingLead.email && <p className="mt-1 text-xs text-slate-600">Email: {existingLead.email}</p>}
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {isAlreadyAssociated
                  ? "Este prospecto ya está registrado en esta campaña."
                  : "Este prospecto ya existe. Se añadirá a la campaña seleccionada sin crear un registro duplicado."}
              </p>
              {isAlreadyAssociated && (
                <Button type="button" variant="link" size="sm" onClick={openExistingLead} className="mt-1 h-auto px-0 text-xs">
                  Abrir detalle del prospecto
                </Button>
              )}
            </div>
          )}

          {!isSearching && hasIdentityConflict && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              El celular y el correo pertenecen a prospectos diferentes. Verifica los datos.
            </div>
          )}

          {!isSearching && isLookupError && canLookup && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              No fue posible comprobar si el prospecto ya existe.
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-6">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting} className="h-10 rounded-xl px-4 text-xs font-semibold">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isAlreadyAssociated || hasIdentityConflict}
              className="h-10 rounded-xl px-4 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando...</>
              ) : isAlreadyAssociated ? (
                "Ya registrado"
              ) : existingLead ? (
                "Añadir a campaña"
              ) : (
                "Registrar lead"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
