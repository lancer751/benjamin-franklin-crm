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
import type { CreateCategoryPayload, ProductCategory } from "../../types/category.types";

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createCategory: (payload: CreateCategoryPayload) => Promise<ProductCategory>;
  onCreated: (category: ProductCategory) => void;
  returnFocusElement?: HTMLElement | null;
}

export const CreateCategoryDialog = ({
  open,
  onOpenChange,
  createCategory,
  onCreated,
  returnFocusElement,
}: CreateCategoryDialogProps) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setError("");
    }
  }, [open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isSubmitting) onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const category = await createCategory({ name: trimmedName });
      onCreated(category);
      onOpenChange(false);
      toast.success("Categoría creada correctamente.");
    } catch (requestError) {
      setError(
        getCategoryErrorMessage(requestError, "No fue posible crear la categoría."),
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
            <DialogTitle>Nueva categoría</DialogTitle>
            <DialogDescription>
              Crea una categoría sin salir del formulario del producto.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="new-category-name">Nombre de la categoría</Label>
            <Input
              id="new-category-name"
              autoFocus
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError("");
              }}
              disabled={isSubmitting}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "new-category-error" : undefined}
              className="rounded-xl"
            />
            {error && (
              <p id="new-category-error" role="alert" className="text-sm text-destructive">
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
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              {isSubmitting ? "Creando..." : "Crear categoría"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
