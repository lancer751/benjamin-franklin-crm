import { useEffect, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { getCategoryErrorMessage } from "../../services/categoryService";
import type { ProductCategory } from "../../types/category.types";

interface DeleteCategoryDialogProps {
  category: ProductCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deleteCategory: (id: string) => Promise<void>;
  onDeleted: (category: ProductCategory) => void;
  returnFocusElement?: HTMLElement | null;
}

export const DeleteCategoryDialog = ({
  category,
  open,
  onOpenChange,
  deleteCategory,
  onDeleted,
  returnFocusElement,
}: DeleteCategoryDialogProps) => {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) setError("");
  }, [open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isSubmitting) onOpenChange(nextOpen);
  };

  const handleDelete = async () => {
    if (!category) return;
    setIsSubmitting(true);
    setError("");
    try {
      await deleteCategory(category.id);
      onDeleted(category);
      onOpenChange(false);
      toast.success("Categoría eliminada correctamente.");
    } catch (requestError) {
      setError(
        getCategoryErrorMessage(requestError, "No fue posible eliminar la categoría."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="rounded-2xl sm:max-w-md"
        onEscapeKeyDown={(event) => isSubmitting && event.preventDefault()}
        onInteractOutside={(event) => isSubmitting && event.preventDefault()}
        onCloseAutoFocus={(event) => {
          if (returnFocusElement?.isConnected) {
            event.preventDefault();
            returnFocusElement.focus();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Eliminar categoría</DialogTitle>
          <DialogDescription className="space-y-1 pt-1">
            <span className="block">
              Estás por eliminar “{category?.name}”.
            </span>
            <span className="block">Esta acción no se puede deshacer.</span>
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
            aria-label={`Eliminar categoría ${category?.name ?? "seleccionada"}`}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Trash2 />}
            {isSubmitting ? "Eliminando..." : "Eliminar categoría"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
