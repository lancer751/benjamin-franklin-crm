import { useMemo, useState } from "react";
import { AlertTriangle, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import { ScrollArea } from "@/core/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/core/components/ui/table";
import type { ProductCategory } from "../../types/category.types";

interface ManageCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ProductCategory[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onCreate: (trigger: HTMLButtonElement) => void;
  onEdit: (category: ProductCategory, trigger: HTMLButtonElement) => void;
  onDelete: (category: ProductCategory, trigger: HTMLButtonElement) => void;
  returnFocusElement?: HTMLElement | null;
}

export const ManageCategoriesDialog = ({
  open,
  onOpenChange,
  categories,
  isLoading,
  isError,
  onRetry,
  onCreate,
  onEdit,
  onDelete,
  returnFocusElement,
}: ManageCategoriesDialogProps) => {
  const [search, setSearch] = useState("");
  const filteredCategories = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es");
    if (!normalizedSearch) return categories;
    return categories.filter((category) =>
      category.name.toLocaleLowerCase("es").includes(normalizedSearch),
    );
  }, [categories, search]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setSearch("");
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex max-h-[85vh] flex-col rounded-2xl p-0 sm:max-w-3xl"
        onCloseAutoFocus={(event) => {
          if (returnFocusElement?.isConnected) {
            event.preventDefault();
            returnFocusElement.focus();
          }
        }}
      >
        <DialogHeader className="border-b border-slate-100 px-6 py-5 pr-12">
          <DialogTitle>Administrar categorías</DialogTitle>
          <DialogDescription>
            Crea, edita o elimina las categorías disponibles para productos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 px-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar categoría..."
                aria-label="Buscar categoría"
                className="rounded-xl pl-9"
              />
            </div>
            <Button type="button" onClick={(event) => onCreate(event.currentTarget)}>
              <Plus />
              Nueva categoría
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200">
            {isLoading ? (
              <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-slate-500">
                <Loader2 className="animate-spin" />
                Cargando categorías...
              </div>
            ) : isError ? (
              <div className="flex min-h-56 flex-col items-center justify-center gap-3 p-6 text-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
                <p className="text-sm text-slate-600">No se pudieron cargar las categorías.</p>
                <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                  Reintentar
                </Button>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="flex min-h-56 items-center justify-center p-6 text-sm text-slate-500">
                No se encontraron categorías.
              </div>
            ) : (
              <ScrollArea className="h-[min(50vh,420px)]">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-slate-50">
                    <TableRow>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="w-52 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium text-slate-800">
                          {category.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(event) => onEdit(category, event.currentTarget)}
                              aria-label={`Editar categoría ${category.name}`}
                            >
                              <Pencil />
                              Editar
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(event) => onDelete(category, event.currentTarget)}
                              className="text-destructive hover:bg-red-50 hover:text-destructive"
                              aria-label={`Eliminar categoría ${category.name}`}
                            >
                              <Trash2 />
                              Eliminar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>
        </div>

        <DialogFooter className="border-t border-slate-100 px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
