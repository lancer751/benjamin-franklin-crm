import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "../services/productService";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const useProductDetail = () => {
  const { id } = useParams<{ id: string }>();

  const [modalMode, setModalMode] = useState<'MARKETING' | 'PRICING' | 'LINK' | null>(null);

  const { data: productRes, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id as string),
    enabled: !!id,
  });

  const product = productRes?.success ? productRes.data : null;

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
      formatAttendanceMode
    }
  };
};
