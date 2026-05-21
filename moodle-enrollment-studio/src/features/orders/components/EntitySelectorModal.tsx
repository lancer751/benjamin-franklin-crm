import { useState, useEffect } from "react";
import { Search, Check, Info, X, CheckSquare, Square } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { ScrollArea } from "@/core/components/ui/scroll-area";
import { Checkbox } from "@/core/components/ui/checkbox";
import { cn } from "@/core/lib/utils";

interface EntitySelectorModalProps<T> {
  title: string;
  description?: string;
  entityList: T[];
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export default function EntitySelectorModal<
  T extends { id: string; name?: string; title?: string; description?: string }
>({
  title,
  description,
  entityList,
  selectedIds,
  onSelect,
  isOpen,
  onClose,
  isLoading = false,
}: EntitySelectorModalProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>([]);

  // Sync initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSelectedIds(selectedIds || []);
      setSearchTerm("");
    }
  }, [isOpen, selectedIds]);

  // Filter entities locally
  const filteredEntities = entityList.filter((item) => {
    const text = `${item.name || ""} ${item.title || ""} ${item.description || ""}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  const handleToggleItem = (id: string) => {
    setLocalSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredEntities.map((item) => item.id);
    setLocalSelectedIds((prev) => {
      // Add all that are not already in the array
      const next = [...prev];
      allFilteredIds.forEach((id) => {
        if (!next.includes(id)) {
          next.push(id);
        }
      });
      return next;
    });
  };

  const handleClearAll = () => {
    const allFilteredIds = filteredEntities.map((item) => item.id);
    // Remove all filtered from selection
    setLocalSelectedIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
  };

  const handleSave = () => {
    onSelect(localSelectedIds);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border border-slate-200 shadow-xl bg-white animate-in fade-in-50 zoom-in-95 duration-200">
        
        {/* HEADER */}
        <DialogHeader className="p-6 bg-slate-50/50 border-b border-slate-100 pb-4">
          <DialogTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs text-slate-500 pt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* SEARCH BAR */}
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* CONTENIDO DEL LISTADO */}
        <div className="px-6 py-2 bg-slate-50/30 flex items-center justify-between border-b border-slate-100 text-[11px] font-medium text-slate-500">
          <div>
            <span>Filtrados: <strong>{filteredEntities.length}</strong></span>
            <span className="mx-2 text-slate-300">•</span>
            <span>Seleccionados en total: <strong className="text-primary">{localSelectedIds.length}</strong></span>
          </div>
          {filteredEntities.length > 0 && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-primary hover:text-primary-dark transition-colors font-semibold flex items-center gap-1"
              >
                Marcar Todos
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-slate-500 hover:text-slate-700 transition-colors font-semibold flex items-center gap-1"
              >
                Desmarcar Todos
              </button>
            </div>
          )}
        </div>

        <ScrollArea className="h-64 px-6 py-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-[11px] font-medium text-slate-400">Cargando catálogo...</p>
            </div>
          ) : filteredEntities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-center text-slate-400">
              <Info size={20} className="text-slate-300" />
              <p className="text-xs font-semibold">No se encontraron elementos</p>
              <p className="text-[10px] max-w-[220px]">
                {searchTerm ? "Prueba con otros términos de búsqueda." : "El catálogo está vacío."}
              </p>
            </div>
          ) : (
            <div className="space-y-2 py-2">
              {filteredEntities.map((item) => {
                const isSelected = localSelectedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleItem(item.id)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none group",
                      isSelected
                        ? "bg-primary/5 border-primary shadow-sm hover:bg-primary/[0.07]"
                        : "bg-white border-slate-100 hover:bg-slate-50/80 hover:border-slate-200"
                    )}
                  >
                    <Checkbox
                      id={item.id}
                      checked={isSelected}
                      onCheckedChange={() => handleToggleItem(item.id)}
                      className="mt-0.5 border-slate-350 data-[state=checked]:bg-primary transition-all group-hover:scale-105"
                      onClick={(e) => e.stopPropagation()} // Prevent double triggers
                    />
                    <div className="grid gap-0.5 flex-1 min-w-0">
                      <label className="text-xs font-bold text-slate-800 cursor-pointer truncate leading-tight">
                        {item.name || item.title}
                      </label>
                      {item.description && (
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* FOOTER */}
        <DialogFooter className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-row items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-slate-250 hover:bg-slate-50 h-10 text-xs font-semibold px-4"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-xl btn-primary h-10 text-xs font-semibold px-5 gap-2 shadow-md shadow-primary/10"
          >
            <Check size={14} /> Confirmar ({localSelectedIds.length})
          </Button>
        </DialogFooter>
        
      </DialogContent>
    </Dialog>
  );
}
