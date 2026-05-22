import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCourseEditions } from "@/features/academic/services/courseService";
import { Search, Loader2, Check } from "lucide-react";
import { Input } from "@/core/components/ui/input";
import { Button } from "@/core/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/core/components/ui/dialog";
import { cn } from "@/core/lib/utils";

interface LinkEditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (editionId: string) => void;
  isPending: boolean;
}

const LinkEditionModal = ({ isOpen, onClose, onLink, isPending }: LinkEditionModalProps) => {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: editionsRes, isLoading } = useQuery({
    queryKey: ["course-editions"],
    queryFn: getCourseEditions,
    enabled: isOpen,
  });

  const editions = editionsRes?.success ? editionsRes.data : [];

  const filteredEditions = editions.filter((e: any) => {
    const code = (e.edition_code || "").toLowerCase();
    const teacher = (e.teacher_fullname || "").toLowerCase();
    const modality = (e.modality || "").toLowerCase();
    return code.includes(search.toLowerCase()) || teacher.includes(search.toLowerCase()) || modality.includes(search.toLowerCase());
  });

  const handleSave = () => {
    if (selectedId) {
      onLink(selectedId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg rounded-2xl p-6 gap-4">
        <DialogHeader>
          <DialogTitle className="text-slate-900 font-bold">Vincular Edición Académica</DialogTitle>
          <DialogDescription className="text-slate-500 text-xs">
            Selecciona la edición o cohorte activa para vincularla a este producto comercial y heredar su calendario académico.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por código, profesor o modalidad..." 
            className="pl-9 rounded-xl text-xs bg-slate-50/50 border-slate-200" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="max-h-[300px] overflow-y-auto pr-1 space-y-2 py-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Cargando cohortes disponibles...</span>
            </div>
          ) : filteredEditions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No se encontraron ediciones que coincidan con la búsqueda.
            </div>
          ) : (
            filteredEditions.map((e: any) => {
              const isSelected = selectedId === e.id;
              return (
                <div 
                  key={e.id}
                  onClick={() => setSelectedId(e.id)}
                  className={cn(
                    "p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-center justify-between text-xs",
                    isSelected 
                      ? "border-primary bg-primary/5 text-primary shadow-xs" 
                      : "border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700"
                  )}
                >
                  <div className="space-y-1">
                    <p className="font-bold font-mono text-slate-900">{e.edition_code || "Sin Código"}</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Profesor: <span className="font-semibold text-slate-700">{e.teacher_fullname || "Por asignar"}</span> • Modalidad: <span className="font-semibold text-slate-700">{e.modality}</span>
                    </p>
                  </div>
                  {isSelected && <Check size={16} className="text-primary" />}
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="flex sm:justify-end gap-2 pt-2 border-t border-slate-100">
          <Button variant="outline" className="rounded-xl text-xs" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button 
            className="rounded-xl text-xs btn-primary gap-1.5 shadow-md shadow-primary/10" 
            onClick={handleSave}
            disabled={!selectedId || isPending}
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Vincular Edición
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LinkEditionModal;
