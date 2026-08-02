import { getCampaignMemberStatusLabel } from "@/core/constants/campaignMemberStatus";
import type { LeadCampaignViewModel } from "../../adapters/leadDetailAdapter";

interface CampaignContextSelectorProps {
  members: LeadCampaignViewModel[];
  selectedMemberId: string;
  onChange: (memberId: string) => void;
}

export function CampaignContextSelector({ members, selectedMemberId, onChange }: CampaignContextSelectorProps) {
  if (members.length <= 1) return null;

  return (
    <label className="mb-5 block max-w-xl text-sm font-medium">
      Actividad de la campaña
      <select
        className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 font-normal"
        value={selectedMemberId}
        onChange={(event) => onChange(event.target.value)}
      >
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.campaignName} · {getCampaignMemberStatusLabel(member.status)} · {member.assignedUser?.name ?? "Sin asignar"}
          </option>
        ))}
      </select>
    </label>
  );
}
