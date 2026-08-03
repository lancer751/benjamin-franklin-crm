import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
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
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { getCategoryErrorMessage } from "../../services/categoryService";
import type {
  CategoryMutationVariables,
  ProductCategory,
} from "../../types/category.types";

interface EditCategoryDialogProps {
  category: ProductCategory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  updateCategory: (variables: CategoryMutationVariables) => Promise<ProductCategory>;
  returnFocusElement?: HTMLElement | null;
}

export const EditCategoryDialog = ({
  category,
  open,
  onOpenChange,
  updateCategory,
  returnFocusElement,
}: EditCategoryDialogProps) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && category) {
      setName(category.name);
      setError("");
    }
  }, [category, open]);

  const trimmedName = name.trim();
  const hasChanges = Boolean(category && trimmedName !== category.name);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isSubmitting) onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!category || !trimmedName || !hasChanges) return;

    setIsSubmitting(true);
    setError("");
    try {
      await updateCategory({ id: category.id, payload: { name: trimmedName } });
      onOpenChange(false);
      toast.success("Categoría actualizada correctamente.");
    } catch (requestError) {
      setError(
        getCategoryErrorMessage(requestError, "No fue posible actualizar la categoría."),
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
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Editar categoría</DialogTitle>
            <DialogDescription>
              El nombre actualizado se reflejará en todos los selectores.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="edit-category-name">Nombre</Label>
            <Input
              id="edit-category-name"
              autoFocus
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError("");
              }}
              disabled={isSubmitting}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "edit-category-error" : undefined}
              className="rounded-xl"
            />
            {error && (
              <p id="edit-category-error" role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>

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
              type="submit"
              disabled={isSubmitting || !trimmedName || !hasChanges}
            >
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
