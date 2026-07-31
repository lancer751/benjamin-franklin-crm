import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";
import { Label } from "@/core/components/ui/label";
import { Textarea } from "@/core/components/ui/textarea";
import { interactionFormSchema, type InteractionFormValues } from "../../schemas/interactionFormSchema";
import { INTERACTION_TYPE_OPTIONS } from "../../utils/interactionType.constants";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  error?: string;
  onSubmit: (data: InteractionFormValues, done: () => void) => void;
}

const defaultValues: InteractionFormValues = { type: "CALL", notes: "" };

export function CreateInteractionDialog({ open, onOpenChange, isPending, error, onSubmit }: Props) {
  const form = useForm<InteractionFormValues>({
    resolver: zodResolver(interactionFormSchema),
    defaultValues,
    mode: "onTouched",
  });
  const notes = form.watch("notes") || "";

  useEffect(() => {
    if (open) form.reset(defaultValues);
  }, [form, open]);

  const submit = form.handleSubmit((values) => {
    onSubmit(values, () => {
      form.reset(defaultValues);
      onOpenChange(false);
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva interacción</DialogTitle>
          <DialogDescription>Registra la actividad en la campaña seleccionada.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 py-2" noValidate>
          <div className="space-y-2">
            <Label htmlFor="interaction-type">Tipo *</Label>
            <select
              id="interaction-type"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              aria-invalid={Boolean(form.formState.errors.type)}
              aria-describedby={form.formState.errors.type ? "interaction-type-error" : undefined}
              disabled={isPending}
              {...form.register("type")}
            >
              {INTERACTION_TYPE_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
            {form.formState.errors.type && <p id="interaction-type-error" role="alert" className="text-xs text-destructive">{form.formState.errors.type.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="interaction-notes">Notas *</Label>
            <Textarea
              id="interaction-notes"
              rows={5}
              maxLength={255}
              placeholder="Describe el contacto realizado…"
              aria-invalid={Boolean(form.formState.errors.notes)}
              aria-describedby={form.formState.errors.notes ? "interaction-notes-error interaction-notes-count" : "interaction-notes-count"}
              disabled={isPending}
              {...form.register("notes")}
            />
            <div className="flex items-start justify-between gap-3">
              {form.formState.errors.notes
                ? <p id="interaction-notes-error" role="alert" className="text-xs text-destructive">{form.formState.errors.notes.message}</p>
                : <span />}
              <p id="interaction-notes-count" className="shrink-0 text-xs text-muted-foreground">{notes.length}/255 caracteres</p>
            </div>
          </div>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? "Registrando…" : "Registrar gestión"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
