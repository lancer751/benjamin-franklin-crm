import { Users, UserMinus } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";

interface CampaignSellersTableProps {
  campaign: any;
  onRemoveSeller: (sellerId: string, name: string) => void;
  isRemoving: boolean;
}

export const CampaignSellersTable = ({
  campaign,
  onRemoveSeller,
  isRemoving,
}: CampaignSellersTableProps) => {
  // CORRECCIÓN: Recorrer campaign.sellersOnCampaign o campaign.sellers
  const sellersList = campaign.sellersOnCampaign || campaign.sellers || [];

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users size={18} className="text-primary" /> Asesores de Ventas Asignados ({sellersList.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {sellersList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-t">
            <Users size={48} className="mb-3 opacity-20" />
            <p className="text-sm font-medium">Aún no hay asesores de venta asignados a esta campaña</p>
          </div>
        ) : (
          <div className="border-t">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Asesor
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Total de Órdenes
                  </th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {sellersList.map((campaignSeller: any) => {
                  const seller = campaignSeller.seller || campaignSeller;
                  if (!seller) return null;
                  const sellerName = seller.user
                    ? `${seller.user.first_name || ""} ${seller.user.last_name || ""}`.trim()
                    : `Asesor ${seller.id?.slice(0, 4) || ""}`;

                  return (
                    <tr
                      key={campaignSeller.id || seller.id}
                      className="border-b border-border hover:bg-muted/5 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-foreground flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          {sellerName.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <span>{sellerName}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {seller.total_orders || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                          onClick={() => onRemoveSeller(seller.id, sellerName)}
                          disabled={isRemoving}
                        >
                          <UserMinus size={16} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
