import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useWatch } from "react-hook-form";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useOrderLeadContext } from "../hooks/useOrderLeadContext";
import { useOrderForm } from "../hooks/useOrderForm";
import type {
  OrderCreationSubmissionContext,
  OrderFormValues,
  OrderProduct,
  OrderResponse,
} from "../types";
import type { AdvisorFilterOption } from "@/features/leads/adapters/campaignAssignmentAdapter";
import { OrderAssigneeSection } from "./OrderAssigneeSection";
import { OrderItemsSection } from "./OrderItemsSection";
import { OrderLeadSection } from "./OrderLeadSection";
import { OrderStatusSection } from "./OrderStatusSection";
import { OrderSummary } from "./OrderSummary";

interface OrderFormProps {
  mode: "create" | "edit";
  initialValues?: OrderFormValues;
  order?: OrderResponse;
  products: OrderProduct[];
  itemsEditable?: boolean;
  limitation?: string;
  assigneeOptions?: AdvisorFilterOption[];
  assigneesLoading?: boolean;
  isSubmitting: boolean;
  submitError?: string;
  onSubmit: (
    values: OrderFormValues,
    creationContext?: OrderCreationSubmissionContext,
  ) => void | Promise<void>;
  onCancel: () => void;
}

export function OrderForm({
  mode,
  initialValues,
  order,
  products,
  itemsEditable = true,
  limitation,
  assigneeOptions = [],
  assigneesLoading,
  isSubmitting,
  submitError,
  onSubmit,
  onCancel,
}: OrderFormProps) {
  const controller = useOrderForm({
    mode,
    initialValues,
    products,
    itemsEditable,
  });
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = controller.form;
  const authUserId = useAuthStore((state) => state.user?.id ?? "");
  const authRole = useAuthStore((state) => state.user?.role.name ?? "");
  const leadId = useWatch({ control, name: "leadId" });
  const leadContextQuery = useOrderLeadContext(
    mode === "create" ? leadId : "",
  );
  const allCampaigns = leadContextQuery.data?.matriculatedCampaigns ?? [];
  const campaigns = authRole === "SALES_REP"
    ? allCampaigns.filter((campaign) => campaign.assignedUserId === authUserId)
    : allCampaigns;
  const [selectedCampaignId, setSelectedCampaignId] = useState("");

  useEffect(() => {
    setSelectedCampaignId("");
    if (mode === "create" && leadId) {
      setValue("order_items", [{ product_id: "", attendance_mode: "", payment_modality: "FULL", discount_code: null }]);
    }
  }, [leadId, mode, setValue]);

  useEffect(() => {
    const campaign = campaigns[0];
    if (campaigns.length === 1 && campaign) {
      setSelectedCampaignId(campaign.memberId);
    } else {
      setSelectedCampaignId("");
    }
  }, [campaigns]);

  const selectedCampaign = campaigns.find(
    (campaign) =>
      campaign.memberId === selectedCampaignId,
  );
  const creationReady = Boolean(
    mode === "create" &&
      leadContextQuery.data &&
      !leadContextQuery.isFetching &&
      selectedCampaign &&
      (authRole !== "SALES_REP" || selectedCampaign.assignedUserId === authUserId),
  );

  const submitForm = (values: OrderFormValues) => {
    if (mode === "create") {
      if (!selectedCampaign) {
        return;
      }
      return onSubmit(values, {
        campaign: selectedCampaign,
      });
    }
    return onSubmit(values);
  };

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      <div className="space-y-6">
        <OrderLeadSection
          mode={mode}
          control={control}
          orderLead={order?.member.lead ?? order?.lead}
          leadContext={leadContextQuery.data}
          isLoadingLeadContext={
            mode === "create" && Boolean(leadId) && leadContextQuery.isFetching
          }
          leadContextError={mode === "create" && leadContextQuery.isError}
          selectedCampaignId={selectedCampaignId}
          onSelectedCampaignIdChange={setSelectedCampaignId}
          onRetryLeadContext={() => void leadContextQuery.refetch()}
        />

        <OrderItemsSection
          title={mode === "create" ? "2. Productos de la orden" : "Productos"}
          control={control}
          setValue={setValue}
          fields={controller.fields}
          products={products}
          itemsEditable={itemsEditable}
          limitation={limitation}
          existingDetails={order?.orderDetails}
          error={
            typeof errors.order_items?.message === "string"
              ? errors.order_items.message
              : undefined
          }
          onAdd={controller.appendItem}
          onRemove={controller.removeItem}
        />

        {mode === "edit" && (
          <>
            <OrderAssigneeSection
              control={control}
              options={assigneeOptions}
              isLoading={assigneesLoading}
            />
            <OrderStatusSection control={control} />
          </>
        )}

        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={
              !controller.canSubmit ||
              isSubmitting ||
              (mode === "create" && !creationReady)
            }
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {mode === "create" ? "Crear orden" : "Guardar cambios"}
          </Button>
        </div>
      </div>

      <OrderSummary
        {...controller.preview}
        serverValues={
          !itemsEditable && order
            ? {
                subtotal: order.sub_total,
                discount: order.discount || 0,
                total: order.total_amount,
              }
            : undefined
        }
      />
    </form>
  );
}
