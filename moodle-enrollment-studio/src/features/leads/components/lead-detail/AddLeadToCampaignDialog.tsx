import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";
import { Label } from "@/core/components/ui/label";
import { useAddLeadToCampaign } from "../../hooks/useAddLeadToCampaign";

const selectClass = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
const sources = [
  ["FACEBOOK", "Facebook"], ["INSTAGRAM", "Instagram"], ["TIKTOK", "TikTok"],
  ["WHATSAPP", "WhatsApp"], ["WEBSITE", "Sitio web"],
] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  role: string;
  sellerId: string;
  associatedCampaignIds: Set<string>;
  onAdded: (memberId: string) => void;
}

export function AddLeadToCampaignDialog(props: Props) {
  const controller = useAddLeadToCampaign(props.leadId, props.role, props.sellerId, props.associatedCampaignIds, (memberId) => {
    props.onOpenChange(false);
    props.onAdded(memberId);
  });
  const [campaignId, setCampaignId] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [source, setSource] = useState<(typeof sources)[number][0]>("WHATSAPP");
  const isSalesRep = props.role === "SALES_REP";
  const selectedCampaign = useMemo(() => controller.campaigns.find((campaign) => campaign.id === campaignId), [campaignId, controller.campaigns]);
  const resetMutation = controller.mutation.reset;

  useEffect(() => {
    if (!props.open) return;
    setCampaignId(""); setSellerId(""); setSource("WHATSAPP"); resetMutation();
  }, [props.open, resetMutation]);

  const submit = () => controller.mutation.mutate({ campaignId, sellerId: isSalesRep ? props.sellerId : sellerId, source });
  const canSubmit = Boolean(campaignId && (isSalesRep ? props.sellerId : sellerId) && !controller.mutation.isPending);
  const error = controller.mutation.error instanceof Error ? controller.mutation.error.message : "";

  return <Dialog open={props.open} onOpenChange={props.onOpenChange}><DialogContent className="max-h-[95vh] w-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg">
    <DialogHeader><DialogTitle>Agregar a campaña</DialogTitle><DialogDescription>Asocia el prospecto sin cambiar su campaña principal actual.</DialogDescription></DialogHeader>
    {controller.isLoading ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div> : controller.isError ? <Alert variant="destructive"><AlertDescription>No fue posible cargar las campañas disponibles.</AlertDescription></Alert> : controller.campaigns.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Este prospecto ya pertenece a todas las campañas disponibles.</p> : <div className="space-y-4 py-2">
      <div className="space-y-2"><Label htmlFor="detail-campaign">Campaña *</Label><select id="detail-campaign" className={selectClass} value={campaignId} onChange={(event) => { setCampaignId(event.target.value); setSellerId(""); }}><option value="">Selecciona una campaña</option>{controller.campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name}</option>)}</select></div>
      <div className="space-y-2"><Label htmlFor="detail-source">Origen *</Label><select id="detail-source" className={selectClass} value={source} onChange={(event) => setSource(event.target.value as typeof source)}>{sources.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      {!isSalesRep && <div className="space-y-2"><Label htmlFor="detail-seller">Asesor *</Label><select id="detail-seller" className={selectClass} value={sellerId} disabled={!campaignId} onChange={(event) => setSellerId(event.target.value)}><option value="">Selecciona un asesor</option>{selectedCampaign?.sellers.map((seller) => <option key={seller.id} value={seller.id}>{seller.name}</option>)}</select>{campaignId && selectedCampaign?.sellers.length === 0 && <p className="text-xs text-destructive">Esta campaña no tiene asesores asignados.</p>}</div>}
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
    </div>}
    <DialogFooter><Button type="button" variant="outline" onClick={() => props.onOpenChange(false)} disabled={controller.mutation.isPending}>Cancelar</Button><Button type="button" onClick={submit} disabled={!canSubmit}>{controller.mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}{controller.mutation.isPending ? "Agregando…" : "Agregar a campaña"}</Button></DialogFooter>
  </DialogContent></Dialog>;
}
