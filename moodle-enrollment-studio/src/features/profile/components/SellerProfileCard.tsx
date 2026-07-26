import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import type { SellerProfile } from "../types/profile.types";

interface SellerProfileCardProps {
  profile: SellerProfile;
}

export function SellerProfileCard({ profile }: SellerProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Perfil de vendedor</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-background p-4">
            <dt className="text-sm text-muted-foreground">Meta comercial</dt>
            <dd className="mt-2 font-medium">{profile.salesTarget}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

