import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProductById, updateProduct } from "../services/productService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { adaptProductToUI } from "../adapters/product.adapter";
import { UIProduct, BackendProductResponse } from "../types/product.types";
import { toast } from "sonner";

export const useProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [modalMode, setModalMode] = useState<'MARKETING' | 'PRICING' | 'LINK' | null>(null);

  const { data: productRes, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id as string),
    enabled: !!id,
  });

  const productRaw = (productRes as any)?.success ? ((productRes as any).data as unknown as BackendProductResponse) : null;
  const product: UIProduct | null = productRaw ? adaptProductToUI(productRaw) : null;

  const linkMutation = useMutation({
    mutationFn: async (editionId: string) => {
      if (!product) throw new Error("No hay producto seleccionado");

      const parsedPayload = {
        name: product.name,
        slug: product.slug || "",
        category_id: product.category?.id || "",
        sales_status: product.sales_status,
        short_description: product.short_description || "",
        description: product.description || "",
        presale_price: product.presale_price != null ? String(product.presale_price) : "",
        discount_price: product.discount_price != null ? String(product.discount_price) : "",
        installments_min_number: product.installments_min_number || 1,
        installments_max_number: product.installments_max_number || 1,
        image_url: product.image_url || "",
        edition_id: editionId,
        prices: product.prices?.map((p: any) => ({
          attendance_mode: p.attendance_mode,
          cash_price: Number(p.cash_price),
          installment_price: Number(p.installment_price),
          enrollment_fee: Number(p.enrollment_fee),
        })) || [],
        benefit_ids: product.benefits?.map((b: any) => b.id) || [],
        faqs: product.faqs?.map((f: any) => f.id) || [],
        certifications: product.certification ? [product.certification.id] : [],
      };
      return await updateProduct(product.id, parsedPayload as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", product?.id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Edición académica vinculada exitosamente");
      setModalMode(null);
    },
    onError: (err) => {
      console.error(err);
      toast.error("Error al vincular la edición académica");
    }
  });

  const formatCurrency = (amount: number | string | null | undefined) => {
    if (amount == null) return "N/A";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (isNaN(num)) return "N/A";
    return `S/ ${num.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string | null | undefined, dateFormat: string = "dd/MM/yyyy") => {
    if (!dateString) return "No definida";
    try {
      return format(new Date(dateString), dateFormat, { locale: es });
    } catch (error) {
      return "Fecha inválida";
    }
  };

  const formatAttendanceMode = (mode: string | null | undefined) => {
    if (!mode) return "No definida";
    const modes: Record<string, string> = {
      "VIRTUAL": "Virtual",
      "PRESENCIAL": "Presencial",
      "HIBRIDO": "Híbrido",
      "HEREDADO": "Heredado"
    };
    return modes[mode] || mode;
  };

  return {
    product,
    isLoading,
    isError,
    actions: {
      modalMode,
      setModalMode,
      formatCurrency,
      formatDate,
      formatAttendanceMode,
      linkEdition: (editionId: string) => linkMutation.mutate(editionId),
      isLinking: linkMutation.isPending,
    }
  };
};
