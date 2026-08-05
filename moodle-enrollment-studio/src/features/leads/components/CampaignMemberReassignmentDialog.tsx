import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/core/components/ui/select";
import type { AdvisorFilterOption } from "../adapters/campaignAssignmentAdapter";
import type { TeamFollowUpMemberRow } from "../adapters/teamFollowUpAdapter";

interface CampaignMemberReassignmentDialogProps {
  open: boolean;
  members: TeamFollowUpMemberRow[];
  campaignName: string;
  advisors: AdvisorFilterOption[];
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (advisor: AdvisorFilterOption) => void;
}

export function CampaignMemberReassignmentDialog({
  open,
  members,
  campaignName,
  advisors,
  isPending,
  onOpenChange,
  onConfirm,
}: CampaignMemberReassignmentDialogProps) {
  const [advisorUserId, setAdvisorUserId] = useState("");
  const [search, setSearch] = useState("");
  const isBulk = members.length > 1;
  const member = members[0];
  const selectedAdvisor = advisors.find((advisor) => advisor.userId === advisorUserId);
  const availableAdvisors = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es");
    return advisors.filter((advisor) =>
      advisor.name.toLocaleLowerCase("es").includes(normalizedSearch),
    );
  }, [advisors, search]);
  const allAlreadyAssigned = Boolean(
    selectedAdvisor && members.every((item) => item.assignedTo === selectedAdvisor.userId),
  );
  const alreadyAssignedCount = selectedAdvisor
    ? members.filter((item) => item.assignedTo === selectedAdvisor.userId).length
    : 0;
  const sameAsCurrent = !isBulk && selectedAdvisor?.userId === member?.assignedTo;
  const canConfirm = Boolean(selectedAdvisor) && !sameAsCurrent && !allAlreadyAssigned && !isPending;

  useEffect(() => {
    if (!open) {
      setAdvisorUserId("");
      setSearch("");
    }
  }, [open]);

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isBulk ? `Reasignar ${members.length} prospectos` : "Reasignar prospecto"}
          </DialogTitle>
          <DialogDescription>
            Se conservarán la tipificación, tareas e interacciones. Las órdenes ya registradas conservarán su responsable actual.
          </DialogDescription>
        </DialogHeader>

        <dl className="grid gap-3 rounded-lg border bg-muted/20 p-4 text-sm sm:grid-cols-2">
          {!isBulk && <div><dt className="text-muted-foreground">Prospecto</dt><dd className="font-medium">{member.prospectName}</dd></div>}
          <div><dt className="text-muted-foreground">Campaña</dt><dd className="font-medium">{campaignName}</dd></div>
          <div><dt className="text-muted-foreground">{isBulk ? "Asesores actuales" : "Asesor actual"}</dt><dd className="font-medium">{isBulk ? "Varios asesores" : member.advisorName || "Sin asignar"}</dd></div>
        </dl>

        <div className="space-y-2">
          <label htmlFor="reassignment-advisor" className="text-sm font-medium">Nuevo asesor</label>
          {advisors.length > 5 && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" placeholder="Buscar asesor por nombre" />
            </div>
          )}
          <Select value={advisorUserId} onValueChange={setAdvisorUserId}>
            <SelectTrigger id="reassignment-advisor"><SelectValue placeholder="Seleccionar asesor" /></SelectTrigger>
            <SelectContent>
              {availableAdvisors.map((advisor) => <SelectItem key={advisor.userId} value={advisor.userId}>{advisor.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {availableAdvisors.length === 0 && <p className="text-sm text-muted-foreground">No hay asesores vinculados que coincidan con la búsqueda.</p>}
          {sameAsCurrent && <p className="text-sm text-muted-foreground">Selecciona un asesor distinto al actual.</p>}
          {isBulk && allAlreadyAssigned && <p className="text-sm text-muted-foreground">Los prospectos seleccionados ya están asignados a este asesor.</p>}
          {isBulk && alreadyAssignedCount > 0 && !allAlreadyAssigned && <p className="text-sm text-muted-foreground">{alreadyAssignedCount} prospecto{alreadyAssignedCount === 1 ? "" : "s"} ya está{alreadyAssignedCount === 1 ? "" : "n"} asignado{alreadyAssignedCount === 1 ? "" : "s"} a este asesor.</p>}
          {isBulk && selectedAdvisor && !allAlreadyAssigned && <p className="text-sm text-muted-foreground">Los {members.length} prospectos serán reasignados a {selectedAdvisor.name}.</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancelar</Button>
          <Button type="button" onClick={() => selectedAdvisor && onConfirm(selectedAdvisor)} disabled={!canConfirm}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Reasignando…" : isBulk ? `Reasignar ${members.length} prospectos` : "Reasignar prospecto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
