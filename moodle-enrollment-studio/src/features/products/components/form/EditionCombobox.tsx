import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/components/ui/popover";
import { Button } from "@/core/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/core/components/ui/command";
import { Search, Check } from "lucide-react";
import { cn } from "@/core/lib/utils";

interface EditionComboboxProps {
  editionId: string | undefined;
  errors: Record<string, string>;
  setFieldValue: (key: string, value: any) => void;
  editions: any[];
  isLoadingEditions: boolean;
  isEdit: boolean;
}

const EditionCombobox = ({
  editionId,
  errors,
  setFieldValue,
  editions,
  isLoadingEditions,
  isEdit,
}: EditionComboboxProps) => {
  const [openCombobox, setOpenCombobox] = useState(false);

  const availableEditions = editions?.filter(
    (edition) => edition.edition_status === "SCHEDULED"
  ) || [];

  const selectedEdition = editions.find((ed: any) => ed.id === editionId);
  const displayLabel = selectedEdition
    ? `${selectedEdition.edition_code} - ${selectedEdition.course?.name || ""}`
    : isLoadingEditions
      ? "Cargando..."
      : "Buscar edición por código o curso...";

  return (
    <div>
      <label className="form-label text-xs font-bold text-slate-700 mb-2 block">Edición / Cohorte (Buscador)</label>
      <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openCombobox}
            className={cn(
              "w-full justify-between h-11 text-left font-normal border-slate-200 hover:bg-slate-50 transition-all shadow-sm rounded-xl",
              !editionId && "text-muted-foreground",
              errors.edition_id && "border-destructive ring-1 ring-destructive"
            )}
            disabled={isLoadingEditions || isEdit}
          >
            <span className="truncate">
              {displayLabel}
            </span>
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command className="w-full">
            <CommandInput placeholder="Escribe el código o nombre del curso..." className="h-11" />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>No se encontraron ediciones.</CommandEmpty>
              <CommandGroup>
                {availableEditions.map((ed: any) => (
                  <CommandItem
                    key={ed.id}
                    value={`${ed.edition_code} ${ed.course?.name}`}
                    onSelect={() => {
                      setFieldValue("edition_id", ed.id);
                      setOpenCombobox(false);
                    }}
                    className="flex items-center gap-2 py-3 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 text-primary",
                        editionId === ed.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{ed.edition_code}</span>
                      <span className="text-xs text-slate-500">{ed.course?.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {errors.edition_id && <p className="text-destructive text-[11px] font-medium mt-1.5 ml-1">{errors.edition_id}</p>}
    </div>
  );
};

export default EditionCombobox;
