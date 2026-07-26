import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import type { SalesSupervisorProfile } from "../types/profile.types";

interface SupervisorProfileCardProps {
  profile: SalesSupervisorProfile;
}

const yesNo = (value: boolean) => (value ? "Sí" : "No");

export function SupervisorProfileCard({
  profile,
}: SupervisorProfileCardProps) {
  const items = [
    { label: "Nombre del equipo", value: profile.teamName },
    { label: "Máximo de vendedores", value: String(profile.maxSellers) },
    {
      label: "Límite de descuento",
      value: `${profile.discountLimitPercent}%`,
    },
    { label: "Descuento manual máximo", value: profile.maxManualDiscount },
    { label: "Puede asignar leads", value: yesNo(profile.canAssignLeads) },
    { label: "Puede reasignar leads", value: yesNo(profile.canReassignLeads) },
    {
      label: "Puede aprobar descuentos",
      value: yesNo(profile.canApproveDiscounts),
    },
    { label: "Puede cancelar órdenes", value: yesNo(profile.canCancelOrders) },
    {
      label: "Puede ver las ventas del equipo",
      value: yesNo(profile.canViewAllTeamSales),
    },
  ].filter((item): item is { label: string; value: string } => Boolean(item.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Perfil de supervisor</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          {items.map(({ label, value }) => (
            <div key={label} className="rounded-lg border bg-background p-4">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="mt-2 break-words font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

