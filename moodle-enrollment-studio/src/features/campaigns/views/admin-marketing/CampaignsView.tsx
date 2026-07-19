import { useNavigate } from "react-router-dom";
import { Button } from "@/core/components/ui/button";
import DeleteConfirmModal from "@/core/components/DeleteConfirmModal";
import { useCampaigns } from "@/features/campaigns/hooks/useCampaigns";
import { CampaignStatsCards } from "@/features/campaigns/components/CampaignStatsCards";
import { CampaignsTable } from "@/features/campaigns/components/CampaignsTable";

const CampaignsView = () => {
  const navigate = useNavigate();
  const {
    campaigns,
    paginatedCampaigns,
    isLoading,
    isError,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
    campaignToDelete,
    setCampaignToDelete,
    deleteMutation,
    totalBudget,
    totalSpent,
    activeCampaigns,
    spentPercent,
  } = useCampaigns();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Campañas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona y analiza el rendimiento de tus campañas de captación.
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/campanas/nueva")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-xl text-sm animate-in fade-in zoom-in duration-200"
        >
          + Nueva Campaña
        </Button>
      </div>

      {/* Stats Cards */}
      <CampaignStatsCards
        isLoading={isLoading}
        totalBudget={totalBudget}
        totalSpent={totalSpent}
        activeCampaigns={activeCampaigns}
        spentPercent={spentPercent}
        totalCampaignsCount={campaigns.length}
      />

      {/* Table Section */}
      <CampaignsTable
        isLoading={isLoading}
        isError={isError}
        paginatedCampaigns={paginatedCampaigns}
        totalCampaignsCount={campaigns.length}
        currentPage={currentPage}
        totalPages={totalPages}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onDeleteClick={setCampaignToDelete}
        onEditClick={(campaign) => navigate(`/admin/campanas/${campaign.id}/editar`)}
      />

      {/* Modal de confirmación para eliminar */}
      <DeleteConfirmModal
        open={!!campaignToDelete}
        onClose={() => setCampaignToDelete(null)}
        onConfirm={() => {
          if (campaignToDelete) {
            deleteMutation.mutate(campaignToDelete.id);
          }
        }}
        itemName={campaignToDelete?.name || ""}
        itemType="Campaña"
      />
    </div>
  );
};

export default CampaignsView;
