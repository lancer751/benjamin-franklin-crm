import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSellerProfileById, getSellerCampaigns } from "../services/userService";
import { adaptSellerProfile, CleanSellerProfile } from "../adapters/seller.adapter";

export function useSellerDetail() {
  const { id } = useParams<{ id: string }>();

  // 1. Petición para perfil, órdenes y miembros
  const sellerQuery = useQuery({
    queryKey: ["seller-detail", id],
    queryFn: () => getSellerProfileById(id!),
    enabled: !!id,
  });

  // 2. Petición para campañas
  const campaignsQuery = useQuery({
    queryKey: ["seller-campaigns", id],
    queryFn: () => getSellerCampaigns(id!),
    enabled: !!id,
  });

  const isLoading = sellerQuery.isLoading || campaignsQuery.isLoading;
  const isError = sellerQuery.isError || !sellerQuery.data?.data;

  // Adaptación de los datos solo si la petición fue exitosa
  let seller: CleanSellerProfile | null = null;
  if (sellerQuery.data?.data) {
    seller = adaptSellerProfile(
      sellerQuery.data.data, 
      campaignsQuery.data
    );
  }

  return {
    seller,
    isLoading,
    isError,
    // Devolvemos los métodos de refetch por si tu compañero añade un botón de actualizar manualmente
    refetch: () => {
      sellerQuery.refetch();
      campaignsQuery.refetch();
    }
  };
}