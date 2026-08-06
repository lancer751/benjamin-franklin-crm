import { useState, type ChangeEvent, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, UserCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";
import {
  manualLeadSchema,
  type ManualLeadData,
  type ManualLeadFormInput,
} from "@/features/leads/schemas/manualLeadSchema";
import {
  leadFieldsSchema,
  type LeadFieldsData,
  type LeadFieldsInput,
} from "@/features/leads/schemas/leadFieldsSchema";
import { useManualLeadLookup } from "@/features/leads/hooks/useManualLeadRegistration";

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FunnelQuickLeadData) => Promise<void>;
  isSubmitting: boolean;
  campaignId: string;
  sellerProfileId?: string;
}

type FunnelQuickLeadFormInput = ManualLeadFormInput & Pick<LeadFieldsInput, "dni">;
type FunnelQuickLeadData = ManualLeadData & Pick<LeadFieldsData, "dni">;
type FieldErrors = Partial<Record<keyof FunnelQuickLeadFormInput, string>>;

const funnelQuickLeadSchema = manualLeadSchema.merge(leadFieldsSchema.pick({ dni: true }));

const emptyForm: FunnelQuickLeadFormInput = {
  first_name: "",
  last_name: "",
  email: "",
  cellphone: "",
  dni: "",
};

export default function NewLeadModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  campaignId,
  sellerProfileId,
}: NewLeadModalProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const advisorUserId = useAuthStore((state) => state.user?.id ?? "");
  const [formData, setFormData] = useState<FunnelQuickLeadFormInput>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { lookup, state: lookupState, isSearching } = useManualLeadLookup(
    { cellphone: formData.cellphone, email: formData.email },
    campaignId,
    sellerProfileId,
    isOpen,
  );

  const existingLead = lookup?.success && lookup.data?.found ? lookup.data.lead : null;
  const isAlreadyAssociated = lookupState.status === "existing-in-campaign";
  const hasIdentityConflict = lookupState.status === "error"
    && lookupState.message.includes("pertenecen a prospectos diferentes");
  const lookupFailed = lookupState.status === "error" && !hasIdentityConflict;
  const existingPhone = existingLead?.phones.find((phone) => phone.isPrincipal)?.number
    || existingLead?.phones[0]?.number;

  const resetForm = () => {
    setFormData(emptyForm);
    setFieldErrors({});
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as keyof FunnelQuickLeadFormInput;
    const value = field === "dni" ? event.target.value.replace(/\D/g, "").slice(0, 8) : event.target.value;
    setFormData((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSubmitting || isSearching || lookupFailed) return;

    const parsed = funnelQuickLeadSchema.safeParse(formData);
    if (!parsed.success) {
      const errors: FieldErrors = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof FunnelQuickLeadFormInput;
        if (field && !errors[field]) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    if (hasIdentityConflict) {
      toast.error(lookupState.message);
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
    if (lookupState.status !== "existing-in-campaign") return;
    handleClose();
    navigate(`/prospectos/${lookupState.leadId}`);
  };

  const openFullRegistration = () => {
    const params = new URLSearchParams({
      campaignId,
      returnTo: `${location.pathname}${location.search}`,
    });
    if (advisorUserId) params.set("advisorUserId", advisorUserId);
    handleClose();
    navigate(`/prospectos/nuevo?${params.toString()}`);
  };

  const actionLabel = isAlreadyAssociated
    ? "Ya está en la campaña"
    : lookupState.status === "existing-unassigned"
      ? "Agregar a la campaña"
      : "Registrar prospecto";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden rounded-xl border border-border bg-card p-0 shadow-2xl sm:max-w-2xl">
        <DialogHeader className="space-y-1 px-5 pb-3 pt-5 sm:px-6">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <UserPlus className="h-5 w-5 text-primary" /> Registrar nuevo prospecto
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Registro rápido para identificar y agregar un prospecto a esta campaña.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} noValidate className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-3 sm:px-6">
            <div className="grid gap-x-4 gap-y-2.5 md:grid-cols-2">
              <QuickField label="Nombre" name="first_name" value={formData.first_name} error={fieldErrors.first_name} onChange={handleChange} disabled={isSubmitting} autoFocus />
              <QuickField label="Apellido" name="last_name" value={formData.last_name} error={fieldErrors.last_name} onChange={handleChange} disabled={isSubmitting} />
              <QuickField label="Correo electrónico" name="email" type="email" value={formData.email} error={fieldErrors.email} onChange={handleChange} disabled={isSubmitting} />
              <QuickField label="Celular" name="cellphone" type="tel" inputMode="numeric" value={formData.cellphone} error={fieldErrors.cellphone} onChange={handleChange} disabled={isSubmitting} required />
              <QuickField label="DNI" optional name="dni" inputMode="numeric" maxLength={8} value={formData.dni} error={fieldErrors.dni} onChange={handleChange} disabled={isSubmitting} />
            </div>

            <div aria-live="polite" aria-atomic="true">
              {lookupState.status === "loading" && (
                <p className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Buscando prospecto…
                </p>
              )}
              {lookupState.status === "new" && (
                <p className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-xs text-sky-800">
                  Este prospecto se registrará y se asociará a la campaña.
                </p>
              )}
              {(lookupState.status === "existing-unassigned" || lookupState.status === "existing-in-campaign") && (
                <div className={`rounded-lg border px-3 py-2 ${isAlreadyAssociated ? "border-amber-200 bg-amber-50" : "border-blue-200 bg-blue-50"}`}>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                    <UserCheck className="h-4 w-4" /> Prospecto existente
                  </p>
                  <p className="mt-0.5 text-xs text-slate-700">
                    {lookupState.leadName}
                    {existingPhone ? ` · ${existingPhone}` : ""}
                    {existingLead?.email ? ` · ${existingLead.email}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {isAlreadyAssociated
                      ? "Este prospecto ya pertenece a la campaña seleccionada."
                      : "Se reutilizará su registro y se agregará a la campaña sin duplicarlo."}
                  </p>
                  {isAlreadyAssociated && (
                    <Button type="button" variant="link" size="sm" onClick={openExistingLead} className="h-auto px-0 pt-1 text-xs">
                      Abrir detalle del prospecto
                    </Button>
                  )}
                </div>
              )}
              {lookupState.status === "error" && (
                <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {lookupState.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border px-5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <Button type="button" variant="ghost" onClick={openFullRegistration} disabled={isSubmitting} className="h-8 px-2 text-xs font-medium text-muted-foreground">
              Registrar con más información
            </Button>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting} className="h-9 rounded-lg px-4 text-xs font-semibold">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isSearching || lookupFailed || isAlreadyAssociated || hasIdentityConflict}
                className="h-9 rounded-lg px-4 text-xs font-semibold shadow-sm"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Procesando…" : actionLabel}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface QuickFieldProps {
  label: string;
  name: keyof FunnelQuickLeadFormInput;
  value: string;
  error?: string;
  type?: "text" | "email" | "tel";
  inputMode?: "text" | "email" | "tel" | "numeric";
  maxLength?: number;
  required?: boolean;
  optional?: boolean;
  disabled: boolean;
  autoFocus?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function QuickField({ label, name, value, error, type = "text", inputMode, maxLength, required, optional, disabled, autoFocus, onChange }: QuickFieldProps) {
  return (
    <div className="space-y-1">
      <Label htmlFor={`quick-${name}`} className="text-xs font-semibold text-muted-foreground">
        {label}{required && <span className="text-destructive"> *</span>}{optional && <span className="font-normal"> (opcional)</span>}
      </Label>
      <Input
        id={`quick-${name}`}
        name={name}
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        autoComplete={name === "email" ? "email" : name === "cellphone" ? "tel" : "off"}
        className="h-9 rounded-lg border-border bg-slate-50/20 text-sm focus:bg-card"
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `quick-${name}-error` : undefined}
      />
      {error && <p id={`quick-${name}-error`} className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
