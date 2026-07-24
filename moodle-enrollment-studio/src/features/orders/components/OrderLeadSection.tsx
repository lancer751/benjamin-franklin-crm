import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, Search, User } from "lucide-react";
import type { Control } from "react-hook-form";
import { useController } from "react-hook-form";
import { Button } from "@/core/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/core/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/core/components/ui/popover";
import { Badge } from "@/core/components/ui/badge";
import { cn } from "@/core/lib/utils";
import { searchOrderLeads } from "../services/orderService";
import type { OrderFormValues, OrderLeadSummary } from "../types";

interface OrderLeadSectionProps {
  mode: "create" | "edit";
  control: Control<OrderFormValues>;
  orderLead?: OrderLeadSummary;
}

function leadName(lead: OrderLeadSummary): string {
  return [lead.first_name, lead.middle_name, lead.last_name]
    .filter(Boolean)
    .join(" ") || "Prospecto sin nombre";
}

function LeadCard({
  lead,
  onChange,
}: {
  lead: OrderLeadSummary;
  onChange?: () => void;
}) {
  const phone =
    lead.phones?.find((item) => item.isPrincipal)?.number ??
    lead.phones?.[0]?.number;
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <User className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{leadName(lead)}</p>
            {lead.lead_status && (
              <Badge variant="outline">
                {lead.lead_status === "ACTIVE" ? "Activo" : "Inactivo"}
              </Badge>
            )}
          </div>
          <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">
            <p>{phone || "Sin teléfono registrado"}</p>
            <p className="truncate">{lead.email || "Sin correo registrado"}</p>
          </div>
        </div>
        {onChange && (
          <Button type="button" variant="outline" size="sm" onClick={onChange}>
            Cambiar prospecto
          </Button>
        )}
      </div>
    </div>
  );
}

export function OrderLeadSection({
  mode,
  control,
  orderLead,
}: OrderLeadSectionProps) {
  const { field, fieldState } = useController({ control, name: "lead_id" });
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<OrderLeadSummary | undefined>(
    orderLead,
  );

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      350,
    );
    return () => window.clearTimeout(timeout);
  }, [search]);

  const query = useQuery({
    queryKey: ["order-lead-search", debouncedSearch],
    queryFn: ({ signal }) => searchOrderLeads(debouncedSearch, signal),
    enabled: mode === "create" && debouncedSearch.length >= 2,
    staleTime: 30_000,
    retry: false,
  });

  const leads = query.data ?? [];
  const selectedLabel = useMemo(
    () => (selectedLead ? leadName(selectedLead) : undefined),
    [selectedLead],
  );

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold">Prospecto</h2>
        <p className="text-sm text-muted-foreground">
          {mode === "create"
            ? "Busca por nombre, celular o correo y selecciona un prospecto existente."
            : "El prospecto de una orden existente no se puede cambiar."}
        </p>
      </div>

      {mode === "create" ? (
        <>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                aria-invalid={Boolean(fieldState.error)}
                className="h-11 w-full justify-between font-normal"
              >
                <span className={cn("truncate", !selectedLabel && "text-muted-foreground")}>
                  {selectedLabel || "Buscar prospecto..."}
                </span>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-[var(--radix-popover-trigger-width)] p-0"
            >
              <Command shouldFilter={false}>
                <CommandInput
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Nombre, celular o correo..."
                />
                <CommandList>
                  {query.isFetching && (
                    <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Buscando prospectos…
                    </div>
                  )}
                  {!query.isFetching && debouncedSearch.length < 2 && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Escribe al menos 2 caracteres.
                    </div>
                  )}
                  {!query.isFetching && query.isError && (
                    <div className="p-4 text-center text-sm text-destructive">
                      No se pudo consultar los prospectos. Inténtalo nuevamente.
                    </div>
                  )}
                  {!query.isFetching &&
                    !query.isError &&
                    debouncedSearch.length >= 2 && (
                    <>
                      <CommandEmpty>No se encontraron prospectos.</CommandEmpty>
                      <CommandGroup>
                        {leads.map((lead) => (
                          <CommandItem
                            key={lead.id}
                            value={lead.id}
                            onSelect={() => {
                              field.onChange(lead.id);
                              setSelectedLead(lead);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value === lead.id
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium">
                                {leadName(lead)}
                              </span>
                              <span className="block text-xs text-muted-foreground">
                                {lead.phones?.find((phone) => phone.isPrincipal)
                                  ?.number ??
                                  lead.phones?.[0]?.number ??
                                  "Sin teléfono"}
                                {lead.email ? ` · ${lead.email}` : ""}
                              </span>
                            </span>
                            {lead.lead_status && (
                              <Badge variant="outline" className="ml-auto shrink-0">
                                {lead.lead_status === "ACTIVE"
                                  ? "Activo"
                                  : "Inactivo"}
                              </Badge>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {fieldState.error && (
            <p className="text-sm font-medium text-destructive">
              {fieldState.error.message}
            </p>
          )}
          {selectedLead ? (
            <LeadCard
              lead={selectedLead}
              onChange={() => {
                setSearch("");
                setDebouncedSearch("");
                setOpen(true);
              }}
            />
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              Aún no has seleccionado un prospecto.
            </div>
          )}
        </>
      ) : orderLead ? (
        <LeadCard lead={orderLead} />
      ) : (
        <p className="text-sm text-destructive">
          No se recibió la información del prospecto.
        </p>
      )}
    </section>
  );
}
