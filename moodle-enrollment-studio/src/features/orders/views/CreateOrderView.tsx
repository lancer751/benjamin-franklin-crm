import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ShoppingCart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/core/components/ui/alert";
import { Button } from "@/core/components/ui/button";
import { Skeleton } from "@/core/components/ui/skeleton";
import { OrderForm } from "../components/OrderForm";
import { useCreateOrder } from "../hooks/useCreateOrder";
import { emptyOrderFormValues } from "../schemas/orderFormSchema";
import { mapCreateFormToPayload } from "../services/orderMappers";
import {
  getOrderProducts,
  mapOrderApiError,
} from "../services/orderService";
import type { OrderFormValues } from "../types";

export default function CreateOrderView() {
  const navigate = useNavigate();
  const productsQuery = useQuery({
    queryKey: ["order-products"],
    queryFn: getOrderProducts,
  });
  const mutation = useCreateOrder();

  const handleSubmit = (values: OrderFormValues) => {
    mutation.mutate(mapCreateFormToPayload(values));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-10">
      <header className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <ShoppingCart className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva orden</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Selecciona al prospecto y los productos que desea adquirir.
          </p>
        </div>
      </header>

      {productsQuery.isLoading ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : productsQuery.isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No se pudieron cargar los productos</AlertTitle>
          <AlertDescription className="mt-2">
            Reintenta la carga antes de crear una orden.
          </AlertDescription>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => productsQuery.refetch()}
          >
            Reintentar
          </Button>
        </Alert>
      ) : (
        <OrderForm
          mode="create"
          initialValues={emptyOrderFormValues}
          products={productsQuery.data ?? []}
          isSubmitting={mutation.isPending}
          submitError={
            mutation.error ? mapOrderApiError(mutation.error) : undefined
          }
          onSubmit={handleSubmit}
          onCancel={() => navigate("/ordenes")}
        />
      )}
    </div>
  );
}
