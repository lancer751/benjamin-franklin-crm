import { ArrowRight, Loader2, Save } from "lucide-react";
import { Button } from "@/core/components/ui/button";

interface ProductFormActionsProps {
  isSaving: boolean;
  readonly?: boolean;
  label: string;
  loadingLabel: string;
  disabled?: boolean;
  showContinueIcon?: boolean;
  onClick: () => void;
}

const ProductFormActions = ({
  isSaving,
  readonly,
  label,
  loadingLabel,
  disabled,
  showContinueIcon,
  onClick,
}: ProductFormActionsProps) => {
  if (readonly) return null;
  return (
    <div className="flex w-full sm:w-auto">
      <Button type="button" onClick={onClick} disabled={isSaving || disabled} className="w-full rounded-xl sm:w-auto">
        {isSaving
          ? <Loader2 size={15} className="mr-2 animate-spin" />
          : showContinueIcon
            ? <ArrowRight size={15} className="mr-2" />
            : <Save size={15} className="mr-2" />}
        {isSaving ? loadingLabel : label}
      </Button>
    </div>
  );
};

export default ProductFormActions;
