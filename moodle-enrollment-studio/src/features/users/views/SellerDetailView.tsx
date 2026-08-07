import { useState } from "react";
import { Users } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { CampaignMembersPanel } from "@/features/campaigns/components/CampaignMembersPanel";
import {
  SellerCampaignsSection,
  SellerDetailError,
  SellerDetailSkeleton,
  SellerGoalProgress,
  SellerKpiGrid,
  SellerLeadStatusSummary,
  SellerProfileHeader,
} from "../components/seller-detail";
import { useSellerDetail } from "../hooks/useSellerDetail";

interface SellerDetailViewProps {
  sellerUserId?: string;
}

export default function SellerDetailView({ sellerUserId }: SellerDetailViewProps) {
  const authUser = useAuthStore((state) => state.user);
  const isSelfView = authUser?.role?.name === "SALES_REP";
  const enforcedSellerUserId = isSelfView ? authUser?.id : sellerUserId;

  const {
    seller,
    isMissingId,
    isProfileLoading,
    isProfileError,
    refetch,
  } = useSellerDetail(enforcedSellerUserId);

  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedCampaignName, setSelectedCampaignName] = useState<string>("");

  const handleSelectCampaign = (campaignId: string, campaignName: string) => {
    setSelectedCampaignId(campaignId);
    setSelectedCampaignName(campaignName);
  };

  if (isProfileLoading) return <SellerDetailSkeleton />;

  if (isMissingId || isProfileError || !seller) {
    return <SellerDetailError isMissingId={isMissingId} onRetry={refetch} />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 fade-in">
      {/* 1. Header (Avatar, Nombre, Estado, Correo, Celular, Volver) */}
      <SellerProfileHeader seller={seller} isSelfView={isSelfView} />

      {/* 2. KPIs (Fila única de tarjetas compactas) */}
      <SellerKpiGrid seller={seller} isSelfView={isSelfView} />

      {/* 3. Progreso de meta (Barra horizontal limpia) */}
      <SellerGoalProgress seller={seller} isSelfView={isSelfView} />

      {/* 4. Distribución de Leads (lead_status_breakdown en tarjetas pequeñas) */}
      <SellerLeadStatusSummary seller={seller} />

      {/* 5. Campañas asignadas (Cards en cuadrícula responsive 3-col/2-col/1-col con botón Ver prospectos) */}
      <SellerCampaignsSection
        seller={seller}
        selectedCampaignId={selectedCampaignId}
        onSelectCampaign={handleSelectCampaign}
        onRetry={refetch}
      />

      {/* 6. Prospectos de la campaña seleccionada */}
      <section aria-labelledby="prospects-section-title" className="space-y-3 pt-2">
        {!selectedCampaignId ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center space-y-2">
            <Users className="mx-auto h-8 w-8 text-slate-400" />
            <p className="text-sm font-bold text-slate-700">
              Selecciona una campaña para visualizar sus prospectos
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Haz clic en "Ver prospectos" en cualquiera de las tarjetas de campaña asignadas arriba para cargar y gestionar la lista de prospectos.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <CampaignMembersPanel
              campaignId={selectedCampaignId}
              campaignName={selectedCampaignName}
              initialAdvisorUserId={seller.userId}
              variant="campaign-detail"
              title={`Prospectos de la campaña: ${selectedCampaignName}`}
            />
          </div>
        )}
      </section>
    </div>
  );
}
