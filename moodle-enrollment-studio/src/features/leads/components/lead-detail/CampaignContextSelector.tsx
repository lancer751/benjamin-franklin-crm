import type { LeadCampaignMember } from "./leadDetail.types";
import { campaignFor } from "./leadDetail.formatters";

export function CampaignContextSelector({ members, selectedMemberId, onChange }: { members: LeadCampaignMember[]; selectedMemberId: string; onChange: (memberId: string) => void }) {
  if (members.length <= 1) return null;
  return <label className="mb-5 block max-w-md text-sm font-medium">Actividad de la campaña<select className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 font-normal" value={selectedMemberId} onChange={(event) => onChange(event.target.value)}>{members.map((member) => <option key={member.id} value={member.id}>{campaignFor(member)?.name || "Campaña sin nombre"}</option>)}</select></label>;
}
