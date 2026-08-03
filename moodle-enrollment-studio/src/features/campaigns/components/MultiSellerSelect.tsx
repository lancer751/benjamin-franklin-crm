import { Check, ChevronsUpDown, Loader2, RefreshCw, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/core/components/ui/avatar";
import { Badge } from "@/core/components/ui/badge";
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

export interface SellerOption {
  id: string;
  name: string;
  email?: string;
}

interface MultiSellerSelectProps {
  options: SellerOption[];
  value: string[];
  onChange: (value: string[]) => void;
  loading?: boolean;
  error?: boolean;
  disabled?: boolean;
  lockedIds?: string[];
  onRetry?: () => void;
}

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

export function MultiSellerSelect({ options, value, onChange, loading, error, disabled, lockedIds = [], onRetry }: MultiSellerSelectProps) {
  const selected = options.filter((seller) => value.includes(seller.id));

  const toggle = (sellerId: string) => {
    if (lockedIds.includes(sellerId) && value.includes(sellerId)) return;
    onChange(value.includes(sellerId) ? value.filter((id) => id !== sellerId) : [...value, sellerId]);
  };

  return (
    <div className="space-y-2">
      {loading ? (
        <Button type="button" variant="outline" className="w-full justify-start" disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando vendedores...
        </Button>
      ) : error ? (
        <div className="flex gap-2">
          <div className="flex h-10 flex-1 items-center rounded-md border border-destructive/40 px-3 text-sm text-destructive">
            No se pudieron cargar los vendedores.
          </div>
          {onRetry && (
            <Button type="button" variant="outline" size="icon" onClick={onRetry} aria-label="Reintentar vendedores">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              disabled={disabled}
              className="w-full justify-between font-normal"
            >
              <span className={cn(value.length === 0 && "text-muted-foreground")}>
                {value.length ? `${value.length} vendedor${value.length === 1 ? "" : "es"} seleccionado${value.length === 1 ? "" : "s"}` : "Buscar y seleccionar vendedores..."}
              </span>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar por nombre o correo..." />
              <CommandList>
                <CommandEmpty>{options.length ? "No se encontraron vendedores" : "No hay vendedores disponibles"}</CommandEmpty>
                <CommandGroup>
                  {options.map((seller) => (
                    <CommandItem
                      key={seller.id}
                      value={`${seller.name} ${seller.email || ""}`}
                      onSelect={() => toggle(seller.id)}
                      disabled={lockedIds.includes(seller.id) && value.includes(seller.id)}
                      className="gap-3 py-2.5"
                    >
                      <div className={cn("flex h-4 w-4 items-center justify-center rounded border", value.includes(seller.id) && "border-primary bg-primary text-primary-foreground")}>
                        {value.includes(seller.id) && <Check className="h-3 w-3" />}
                      </div>
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">{initials(seller.name)}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{seller.name}</span>
                        {seller.email && <span className="block truncate text-xs text-muted-foreground">{seller.email}</span>}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Vendedores seleccionados">
          {selected.map((seller) => (
            <Badge key={seller.id} variant="secondary" className="gap-1.5 py-1 pl-2 pr-1">
              {seller.name}
              {!lockedIds.includes(seller.id) && (
                <button
                  type="button"
                  onClick={() => toggle(seller.id)}
                  disabled={disabled}
                  className="rounded-full p-0.5 hover:bg-background/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Quitar a ${seller.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
