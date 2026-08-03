import { BadgeCheck, Mail, Phone, UserRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/core/components/ui/avatar";
import { Badge } from "@/core/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { RoleTranslationsMap, translateEnum } from "@/core/utils/dictionaries";
import type { UserAccountProfile } from "../types/profile.types";

interface AccountInformationCardProps {
  account: UserAccountProfile;
}

const initials = (fullName: string) =>
  fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

export function AccountInformationCard({
  account,
}: AccountInformationCardProps) {
  const items = [
    { label: "Correo", value: account.email, icon: Mail },
    { label: "Correo corporativo", value: account.corporateEmail, icon: Mail },
    { label: "Celular", value: account.cellphone, icon: Phone },
    {
      label: "Celular corporativo",
      value: account.corporateCellphone,
      icon: Phone,
    },
  ].filter((item): item is typeof item & { value: string } => Boolean(item.value));

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-16 w-16 border bg-background">
            <AvatarFallback className="text-lg font-semibold text-primary">
              {initials(account.fullName) || <UserRound className="h-6 w-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <CardTitle className="break-words text-xl sm:text-2xl">
              {account.fullName}
            </CardTitle>
            <CardDescription className="mt-1">
              {translateEnum(account.role, RoleTranslationsMap)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <h2 className="text-base font-semibold">Información de la cuenta</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {items.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-lg border bg-background p-4">
              <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </dt>
              <dd className="mt-2 break-all font-medium">{value}</dd>
            </div>
          ))}
          <div className="rounded-lg border bg-background p-4">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              Rol
            </dt>
            <dd className="mt-2 font-medium">
              {translateEnum(account.role, RoleTranslationsMap)}
            </dd>
          </div>
          <div className="rounded-lg border bg-background p-4">
            <dt className="text-sm text-muted-foreground">Estado</dt>
            <dd className="mt-2">
              <Badge variant={account.isActive ? "secondary" : "outline"}>
                {account.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

