import { useEffect, useState } from "react";
import { CalendarDays, ChevronDown, Info, X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Calendar } from "@/core/components/ui/calendar";
import { Label } from "@/core/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/core/components/ui/popover";
import { cn } from "@/core/lib/utils";
import {
  DATE_RANGE_PRESETS,
  EMPTY_PROSPECT_DATE_RANGE,
  formatDateField,
  formatDateRangeLabel,
  isValidProspectDateRange,
  resolveDateRangePreset,
  type DateRangePreset,
  type ProspectDateRange,
} from "../../utils/prospectDateRange";

interface ProspectsDateRangeFilterProps {
  value: ProspectDateRange;
  onApply?: (range: ProspectDateRange) => void;
  applyDisabledReason?: string;
}

export function ProspectsDateRangeFilter({ value, onApply, applyDisabledReason }: ProspectsDateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProspectDateRange>(value);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px), (max-height: 700px)");
    const update = () => setIsCompact(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setDraft(value);
    setOpen(nextOpen);
  };
  const choosePreset = (preset: DateRangePreset) => {
    if (preset === "CUSTOM") {
      setDraft((current) => ({ ...current, preset: "CUSTOM" }));
      return;
    }
    setDraft(resolveDateRangePreset(preset));
  };
  const chooseCalendarRange = (range?: DateRange) => {
    setDraft({ from: range?.from ?? null, to: range?.to ?? null, preset: "CUSTOM" });
  };
  const clearDraft = () => setDraft(EMPTY_PROSPECT_DATE_RANGE);
  const selected: DateRange | undefined = draft.from ? { from: draft.from, to: draft.to ?? undefined } : undefined;
  const isEmpty = !draft.from && !draft.to;
  const canApply = (isEmpty || isValidProspectDateRange(draft)) && Boolean(onApply) && !applyDisabledReason;

  return (
    <div className="space-y-1.5">
      <Label>Rango de fecha</Label>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="w-full justify-between font-normal" aria-label={`Rango de fecha: ${formatDateRangeLabel(value)}`}>
            <span className="flex min-w-0 items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="truncate">{formatDateRangeLabel(value)}</span></span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="flex max-h-[min(42rem,calc(100vh-1.5rem))] w-[min(52rem,calc(100vw-1.5rem))] flex-col overflow-hidden p-0"
        >
          <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[180px_minmax(0,1fr)]">
            <div className="grid grid-cols-2 gap-1 border-b p-3 md:block md:space-y-1 md:border-b-0 md:border-r">
              {DATE_RANGE_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn("w-full justify-start", draft.preset === preset.value && "bg-accent text-accent-foreground")}
                  aria-current={draft.preset === preset.value ? "true" : undefined}
                  onClick={() => choosePreset(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="min-w-0">
              <div className="grid gap-3 border-b p-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
                <div><p className="text-xs font-medium text-muted-foreground">Fecha de inicio</p><p className="mt-1 rounded-md border bg-muted/30 px-3 py-2 text-sm">{formatDateField(draft.from)}</p></div>
                <span className="hidden pb-2 text-muted-foreground sm:block">–</span>
                <div><p className="text-xs font-medium text-muted-foreground">Fecha final</p><p className="mt-1 rounded-md border bg-muted/30 px-3 py-2 text-sm">{formatDateField(draft.to)}</p></div>
              </div>
              <div className="flex justify-center p-1.5">
                <Calendar
                  mode="range"
                  selected={selected}
                  onSelect={chooseCalendarRange}
                  numberOfMonths={isCompact ? 1 : 2}
                  disabled={{ after: new Date() }}
                  className="p-2"
                  classNames={{
                    months: "flex flex-col gap-3 sm:flex-row",
                    month: "space-y-2",
                    row: "mt-1 flex w-full",
                  }}
                  initialFocus
                />
              </div>
              {applyDisabledReason && <div className="px-3 pb-3"><Alert><Info className="h-4 w-4" /><AlertDescription>{applyDisabledReason}</AlertDescription></Alert></div>}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t bg-background p-3 shadow-[0_-4px_12px_rgba(15,23,42,0.05)]">
            <Button type="button" variant="ghost" size="sm" onClick={clearDraft} disabled={!draft.from && !draft.to}><X className="h-4 w-4" />Limpiar</Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancelar</Button>
              <Button type="button" disabled={!canApply} onClick={() => { if (onApply) onApply(draft); setOpen(false); }}>Aplicar</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
