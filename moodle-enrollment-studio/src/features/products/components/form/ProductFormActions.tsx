import { ArrowRight, Loader2, Save } from "lucide-react";
import { Button } from "@/core/components/ui/button";

interface ProductFormActionsProps {
  isSaving: boolean;
  readonly?: boolean;
  isLastStep?: boolean;
  primaryLabel?: string;
  primaryDisabled?: boolean;
  onSaveDraft: () => void;
  onContinue: () => void;
}

const ProductFormActions = ({
  isSaving,
  readonly,
  isLastStep,
  primaryLabel,
  primaryDisabled,
  onSaveDraft,
  onContinue,
}: ProductFormActionsProps) => {
  if (readonly) return null;
  return (
    <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row">
      <Button type="button" variant="outline" onClick={onSaveDraft} disabled={isSaving} className="rounded-xl">
        <Save size={15} className="mr-2" /> Guardar borrador
      </Button>
      <Button type="button" onClick={onContinue} disabled={isSaving || primaryDisabled} className="rounded-xl">
        {isSaving ? <Loader2 size={15} className="mr-2 animate-spin" /> : isLastStep ? <Save size={15} className="mr-2" /> : <ArrowRight size={15} className="mr-2" />}
        {primaryLabel || (isLastStep ? "Guardar cambios" : "Guardar y continuar")}
      </Button>
    </div>
  );
};

export default ProductFormActions;
