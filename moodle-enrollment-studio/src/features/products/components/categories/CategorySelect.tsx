import { useId, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronsUpDown,
  FolderOpen,
  Loader2,
  Plus,
  Settings,
} from "lucide-react";
import { Button } from "@/core/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/core/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/components/ui/popover";
import { Separator } from "@/core/components/ui/separator";
import { cn } from "@/core/lib/utils";
import { useCategories } from "../../hooks/useCategories";
import type { ProductCategory } from "../../types/category.types";
import { CreateCategoryDialog } from "./CreateCategoryDialog";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";
import { EditCategoryDialog } from "./EditCategoryDialog";
import { ManageCategoriesDialog } from "./ManageCategoriesDialog";

interface CategorySelectProps {
  value: string;
  onChange: (categoryId: string) => void;
  error?: string;
  disabled?: boolean;
}

export const CategorySelect = ({
  value,
  onChange,
  error,
  disabled = false,
}: CategorySelectProps) => {
  const triggerId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<ProductCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);
  const [dialogReturnFocusElement, setDialogReturnFocusElement] =
    useState<HTMLElement | null>(null);
  const {
    categories,
    isLoading,
    isError,
    retry,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === value),
    [categories, value],
  );

  const openCreateDialog = () => {
    setDialogReturnFocusElement(triggerRef.current);
    setIsPopoverOpen(false);
    setIsCreateOpen(true);
  };

  const openManageDialog = () => {
    setDialogReturnFocusElement(triggerRef.current);
    setIsPopoverOpen(false);
    setIsManageOpen(true);
  };

  const handleCreated = (category: ProductCategory) => {
    onChange(category.id);
  };

  const handleDeleted = (category: ProductCategory) => {
    if (category.id === value) onChange("");
    setCategoryToDelete(null);
  };

  return (
    <div>
      <label
        htmlFor={triggerId}
        className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600"
      >
        <FolderOpen size={12} className="text-slate-400" />
        Categoría
      </label>

      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            id={triggerId}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={isPopoverOpen}
            aria-invalid={Boolean(error)}
            disabled={disabled}
            className={cn(
              "h-10 w-full justify-between rounded-xl border-slate-200 bg-white px-3 text-left text-xs font-normal shadow-sm hover:bg-slate-50",
              !selectedCategory && "text-muted-foreground",
              error && "border-destructive ring-1 ring-destructive",
            )}
          >
            <span className="truncate">
              {selectedCategory?.name ?? "Seleccionar categoría"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] min-w-72 p-0"
        >
          <Command>
            <CommandInput placeholder="Buscar categoría..." />
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 px-3 py-8 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando categorías...
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-slate-600">No se pudieron cargar las categorías.</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void retry()}
                >
                  Reintentar
                </Button>
              </div>
            ) : (
              <CommandList>
                <CommandEmpty>No se encontraron categorías.</CommandEmpty>
                <CommandGroup>
                  {categories.map((category) => (
                    <CommandItem
                      key={category.id}
                      value={category.name}
                      onSelect={() => {
                        onChange(category.id);
                        setIsPopoverOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-primary",
                          value === category.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="truncate">{category.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            )}
          </Command>

          <Separator />
          <div className="space-y-1 p-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={openCreateDialog}
            >
              <Plus />
              Crear nueva categoría
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={openManageDialog}
            >
              <Settings />
              Administrar categorías
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {error && <p className="mt-1 text-[10px] font-medium text-destructive">{error}</p>}

      <CreateCategoryDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        createCategory={createCategory}
        onCreated={handleCreated}
        returnFocusElement={dialogReturnFocusElement}
      />
      <ManageCategoriesDialog
        open={isManageOpen}
        onOpenChange={setIsManageOpen}
        categories={categories}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void retry()}
        onCreate={(trigger) => {
          setDialogReturnFocusElement(trigger);
          setIsCreateOpen(true);
        }}
        onEdit={(category, trigger) => {
          setDialogReturnFocusElement(trigger);
          setCategoryToEdit(category);
        }}
        onDelete={(category, trigger) => {
          setDialogReturnFocusElement(trigger);
          setCategoryToDelete(category);
        }}
        returnFocusElement={triggerRef.current}
      />
      <EditCategoryDialog
        category={categoryToEdit}
        open={Boolean(categoryToEdit)}
        onOpenChange={(open) => !open && setCategoryToEdit(null)}
        updateCategory={updateCategory}
        returnFocusElement={dialogReturnFocusElement}
      />
      <DeleteCategoryDialog
        category={categoryToDelete}
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
        deleteCategory={deleteCategory}
        onDeleted={handleDeleted}
        returnFocusElement={dialogReturnFocusElement}
      />
    </div>
  );
};
