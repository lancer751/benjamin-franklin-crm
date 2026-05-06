import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { orderFormSchema, OrderFormValues } from "../schemas/orderFormSchema";

// Servicios
import { getProducts } from "@/features/orders/services/productService";
import { getOrderById, createOrder, updateOrder } from "@/features/orders/services/orderService";
import { getAllLeads } from "@/features/leads/services/leadService";

// Mock Auth Hook as requested
const useAuth = () => ({
  user: { id: "4ba00bf4-3399-4446-a496-7fc9d5f3e919" } // Simulado
});

export const useOrderFormModal = (open: boolean, onClose: () => void, initialData?: any) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [openCombobox, setOpenCombobox] = useState(false);

  // 1. Fetch de Datos
  const { data: leadsData, isLoading: isLoadingLeads } = useQuery({
    queryKey: ["leads"],
    queryFn: getAllLeads,
    enabled: open,
  });

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    enabled: open,
  });

  const { data: fullOrderData, isLoading: isLoadingFullOrder } = useQuery({
    queryKey: ['order', initialData?.id],
    queryFn: () => getOrderById(initialData.id),
    enabled: !!initialData?.id && open
  });

  const leads = Array.isArray(leadsData) ? leadsData : (leadsData as any)?.data || [];
  const products = Array.isArray(productsData) ? productsData : [];

  // 2. Configuración de Formulario
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      lead_id: "",
      order_status: "PENDING",
      sub_total: 0,
      total_amount: 0,
      discount: 0,
      generated_by: user.id,
      order_items: [{ product_id: "", price: 0, discount_code: "" }],
    },
  });

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: "order_items" });

  const orderItems = watch("order_items");
  const discountValue = watch("discount") || 0;

  // 3. Cálculos en Tiempo Real
  const subtotal = (orderItems || []).reduce((acc, item) => acc + (Number(item.price) || 0), 0);
  const totalAmount = Math.max(0, subtotal - Number(discountValue));

  useEffect(() => {
    setValue("sub_total", subtotal, { shouldValidate: true });
    setValue("total_amount", totalAmount, { shouldValidate: true });
  }, [subtotal, totalAmount, setValue]);

  // 4. Inicialización de Datos
  useEffect(() => {
    if (open) {
      if (initialData?.id && fullOrderData) {
        const data = fullOrderData;
        reset({
          lead_id: data.lead_id || "",
          order_status: data.order_status || "PENDING",
          sub_total: Number(data.sub_total) || 0,
          total_amount: Number(data.total_amount) || 0,
          discount: Number(data.discount) || 0,
          generated_by: data.generated_by || user.id,
          order_items: data.orderDetails?.length > 0
            ? data.orderDetails.map((item: any) => ({
              product_id: item.product_id,
              price: Number(item.price),
              discount_code: item.discount_code || "",
            }))
            : [{ product_id: "", price: 0, discount_code: "" }],
        });
      } else if (!initialData) {
        reset({
          lead_id: "",
          order_status: "PENDING",
          sub_total: 0,
          total_amount: 0,
          discount: 0,
          generated_by: user.id,
          order_items: [{ product_id: "", price: 0, discount_code: "" }],
        });
      }
    }
  }, [open, fullOrderData, initialData, reset, user.id]);

  // 5. Mutación con Formateo para el Backend
  const mutation = useMutation({
    mutationFn: (data: OrderFormValues) => {
      // Transformación a decimalString (string con 2 decimales) para cumplir con el backend
      const payload = {
        ...data,
        sub_total: data.sub_total.toFixed(2),
        total_amount: data.total_amount.toFixed(2),
        discount: data.discount.toFixed(2),
        generated_by: user.id, // Aseguramos que siempre se envíe
        order_items: data.order_items.map(item => ({
          product_id: item.product_id,
          price: item.price.toFixed(2),
          discount_code: item.discount_code?.trim() || undefined
        }))
      };

      if (initialData?.id) return updateOrder(initialData.id, payload as any);
      return createOrder(payload as any);
    },
    onSuccess: () => {
      toast.success(`Orden ${initialData ? "actualizada" : "creada"} correctamente`);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      onClose();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Error al guardar la orden. Verifique los datos.");
    }
  });

  // Helpers
  const getProductLabel = (product: any) => {
    if (!product) return "Producto sin nombre";
    const editionCode = product.edition?.edition_code ? ` (${product.edition.edition_code})` : "";
    return `${product.name || "Sin nombre"}${editionCode}`;
  };

  const handleAddProduct = () => {
    append({ product_id: "", price: 0, discount_code: "" });
  };

  const onSubmit = handleSubmit((data) => mutation.mutate(data));

  return {
    form,
    fields,
    remove,
    handleAddProduct,
    onSubmit,
    leads,
    products,
    isLoadingLeads,
    isLoadingProducts,
    isLoadingFullOrder,
    openCombobox,
    setOpenCombobox,
    subtotal,
    discountValue,
    totalAmount,
    isPending: mutation.isPending,
    getProductLabel,
    errors,
    control,
    setValue
  };
};
