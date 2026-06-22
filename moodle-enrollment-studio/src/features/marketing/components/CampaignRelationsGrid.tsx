import { Card, CardContent, CardHeader, CardTitle } from "@/core/components/ui/card";
import ProductStatusBadge from "@/features/products/components/shared/ProductStatusBadge";

interface CampaignRelationsGridProps {
  campaign: any;
}

export const CampaignRelationsGrid = ({ campaign }: CampaignRelationsGridProps) => {
  // CORRECCIÓN: Usar campaign.assignedSupervisor como relación del supervisor
  const supervisor = campaign.assignedSupervisor || campaign.supervisor;
  const supervisorUser = supervisor?.user;
  
  const supervisorName = supervisorUser
    ? `${supervisorUser.first_name || ""} ${supervisorUser.last_name || ""}`.trim()
    : "No asignado";
    
  const supervisorEmail = supervisorUser?.email || "No asignado";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Producto / Curso Relacionado */}
      <Card className="flex flex-col justify-between">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Producto / Curso Relacionado</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Nombre del Producto
              </p>
              <p className="font-semibold text-foreground">
                {campaign.relatedProduct?.name || "N/D"}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Estado de Venta
              </p>
              <div className="mt-1">
                <ProductStatusBadge status={campaign.relatedProduct?.sales_status || ""} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supervisor a Cargo */}
      <Card className="flex flex-col justify-between">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Supervisor a Cargo</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Supervisor
              </p>
              <p className="font-semibold text-foreground">
                {supervisorName}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Correo Institucional
              </p>
              <p className="text-foreground text-sm font-medium break-all">
                {supervisorEmail}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
