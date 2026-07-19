import { Check, ChevronsUpDown, Loader2, RefreshCw } from "lucide-react";
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
import { cn } from "@/core/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  searchText?: string;
  description?: string;
}

interface SearchableComboboxProps {
  value?: string | null;
  options: ComboboxOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  loading?: boolean;
  error?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  onRetry?: () => void;
  className?: string;
}

export function SearchableCombobox({
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  loading,
  error,
  disabled,
  onChange,
  onRetry,
  className,
}: SearchableComboboxProps) {
  const selected = options.find((option) => option.value === value);

  if (loading) {
    return (
      <Button type="button" variant="outline" className={cn("w-full justify-start", className)} disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Cargando opciones...
      </Button>
    );
  }

  if (error) {
    return (
      <div className="flex gap-2">
        <div className="flex h-10 flex-1 items-center rounded-md border border-destructive/40 px-3 text-sm text-destructive">
          No se pudieron cargar las opciones.
        </div>
        {onRetry && (
          <Button type="button" variant="outline" size="icon" onClick={onRetry} aria-label="Reintentar carga">
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-label={placeholder}
          aria-expanded={undefined}
          disabled={disabled}
          className={cn("h-auto min-h-10 w-full justify-between px-3 py-2 text-left font-normal", className)}
        >
          <span className="min-w-0">
            <span className={cn("block truncate", !selected && "text-muted-foreground")}>
              {selected?.label || placeholder}
            </span>
            {selected?.description && (
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">{selected.description}</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.searchText || ""}`}
                  onSelect={() => onChange(option.value)}
                  className="items-start gap-2 py-2.5"
                >
                  <Check className={cn("mt-0.5 h-4 w-4 shrink-0", value === option.value ? "opacity-100" : "opacity-0")} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{option.label}</span>
                    {option.description && (
                      <span className="block truncate text-xs text-muted-foreground">{option.description}</span>
                    )}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
