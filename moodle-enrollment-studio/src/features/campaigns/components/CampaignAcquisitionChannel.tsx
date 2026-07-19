import { CheckCircle2, FileText, MessageCircle, Unplug } from "lucide-react";
import { cn } from "@/core/lib/utils";

export type AcquisitionChannel = "META_FORM" | "WHATSAPP" | "NONE";

interface CampaignAcquisitionChannelProps {
  value: AcquisitionChannel;
  onChange: (value: AcquisitionChannel) => void;
  platform: string;
  disabled?: boolean;
  disabledValues?: AcquisitionChannel[];
}

const channels = [
  {
    value: "META_FORM" as const,
    title: "Formulario instantáneo de Meta",
    description: "Vincula una campaña y formulario de Facebook o Instagram.",
    icon: FileText,
  },
  {
    value: "WHATSAPP" as const,
    title: "Click-to-WhatsApp",
    description: "Recibe contactos directamente en un número de WhatsApp.",
    icon: MessageCircle,
  },
  {
    value: "NONE" as const,
    title: "Sin integración externa",
    description: "Gestiona la campaña sin una fuente externa vinculada.",
    icon: Unplug,
  },
];

export function CampaignAcquisitionChannel({ value, onChange, platform, disabled, disabledValues = [] }: CampaignAcquisitionChannelProps) {
  const supportsMeta = platform === "FACEBOOK" || platform === "INSTAGRAM";

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3" role="group" aria-label="Canal de captación">
      {channels.map((channel) => {
        const unavailable = (channel.value !== "NONE" && !supportsMeta) || disabledValues.includes(channel.value);
        const selected = value === channel.value;
        const Icon = channel.icon;

        return (
          <button
            key={channel.value}
            type="button"
            aria-pressed={selected}
            disabled={disabled || unavailable}
            onClick={() => onChange(channel.value)}
            className={cn(
              "relative rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              selected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-background hover:border-primary/40 hover:bg-muted/30",
              unavailable && "cursor-not-allowed opacity-45",
            )}
          >
            {selected && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-primary" />}
            <div className={cn("mb-3 flex h-9 w-9 items-center justify-center rounded-lg", selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
              <Icon className="h-4 w-4" />
            </div>
            <span className="block pr-5 text-sm font-semibold text-foreground">{channel.title}</span>
            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
              {unavailable ? "No disponible para esta plataforma." : channel.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
