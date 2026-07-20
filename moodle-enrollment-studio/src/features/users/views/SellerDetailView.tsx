import { useAuthStore } from "@/store/useAuthStore";
import {
  SellerCampaignsSection,
  SellerDetailError,
  SellerDetailSkeleton,
  SellerEfficiencySummary,
  SellerGoalProgress,
  SellerKpiGrid,
  SellerLeadSourceSummary,
  SellerLeadStatusSummary,
  SellerOrdersSummary,
  SellerProfileHeader,
  SellerRecentLeadActivity,
} from "../components/seller-detail";
import { useSellerDetail } from "../hooks/useSellerDetail";

interface SellerDetailViewProps {
  sellerUserId?: string;
}

export default function SellerDetailView({ sellerUserId }: SellerDetailViewProps) {
  const authUser = useAuthStore((state) => state.user);
  const isSelfView = authUser?.role?.name === "SALES_REP";
  // Un asesor siempre consulta el user_id de su propia sesión, incluso si altera la URL.
  const enforcedSellerUserId = isSelfView ? authUser?.id : sellerUserId;
  const {
    seller,
    isMissingId,
    isProfileLoading,
    isProfileError,
    isCampaignsLoading,
    isCampaignsError,
    refetch,
    refetchCampaigns,
  } = useSellerDetail(enforcedSellerUserId);

  if (isProfileLoading) return <SellerDetailSkeleton />;

  if (isMissingId || isProfileError || !seller) {
    return <SellerDetailError isMissingId={isMissingId} onRetry={refetch} />;
  }

  const campaignsUnavailable = isCampaignsLoading || isCampaignsError;

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 sm:p-6">
      <SellerProfileHeader seller={seller} isSelfView={isSelfView} onRefresh={refetch} />
      <SellerKpiGrid seller={seller} isSelfView={isSelfView} campaignsUnavailable={campaignsUnavailable} />
      <SellerGoalProgress seller={seller} isSelfView={isSelfView} />

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <SellerLeadStatusSummary seller={seller} />
        <SellerLeadSourceSummary seller={seller} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
        <SellerRecentLeadActivity seller={seller} />
        <SellerCampaignsSection
          seller={seller}
          isSelfView={isSelfView}
          isLoading={isCampaignsLoading}
          isError={isCampaignsError}
          onRetry={refetchCampaigns}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.65fr_1.35fr]">
        <SellerOrdersSummary seller={seller} />
        <SellerEfficiencySummary seller={seller} campaignsUnavailable={campaignsUnavailable} />
      </div>
    </div>
  );
}
