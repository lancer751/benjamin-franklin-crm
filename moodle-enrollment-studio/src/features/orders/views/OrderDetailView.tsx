import { AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Skeleton } from "@/core/components/ui/skeleton";
import { useAuthStore } from "@/store/useAuthStore";
import { OrderDetailContent } from "../components/detail/OrderDetailContent";
import { useOrder } from "../hooks/useOrder";
import { getCampaignById } from "@/features/campaigns/services/campaignService";
import { campaignQueryKeys } from "@/features/campaigns/queryKeys";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const campaignNameFromResponse = (response: unknown): string | null => {
  const body = isRecord(response) && isRecord(response.data) ? response.data : response;
  if (!isRecord(body)) return null;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const legacyName = typeof body.campaing_name === "string" ? body.campaing_name.trim() : "";
  return name || legacyName || null;
};

function OrderDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" aria-label="Cargando orden">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-52 w-full rounded-xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function OrderDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role.name);
  const orderQuery = useOrder(id);
  const order = orderQuery.data?.data;
  const campaignId = order?.campaignId ?? "";
  const campaignQuery = useQuery({
    queryKey: campaignQueryKeys.detail(campaignId),
    queryFn: () => getCampaignById(campaignId),
    enabled: Boolean(campaignId),
    staleTime: 5 * 60 * 1000,
  });

  if (orderQuery.isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (orderQuery.isError || !order) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No se pudo cargar la orden</AlertTitle>
          <AlertDescription>
            La orden no existe o no fue posible consultar su información.
          </AlertDescription>
        </Alert>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/ordenes")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al listado
          </Button>
          <Button type="button" onClick={() => orderQuery.refetch()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <OrderDetailContent
      order={order}
      campaignName={campaignNameFromResponse(campaignQuery.data)}
      isCampaignLoading={Boolean(campaignId) && campaignQuery.isLoading}
      isCampaignError={!campaignId || campaignQuery.isError}
      role={role}
      onBack={() => navigate("/ordenes")}
      onEdit={() => navigate(`/ordenes/${order.id}/editar`)}
      onRegisterPayment={() =>
        navigate(`/pagos/nuevo?orderId=${order.id}`)
      }
    />
  );
}
