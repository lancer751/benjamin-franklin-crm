import { BadgeCheck, CircleDollarSign, Mail, UserRound } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/core/components/ui/alert";
import { Avatar, AvatarFallback } from "@/core/components/ui/avatar";
import { Badge } from "@/core/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { Skeleton } from "@/core/components/ui/skeleton";
import { RoleTranslationsMap, translateEnum } from "@/core/utils/dictionaries";
import { useSalesSupervisorProfile } from "../hooks/useSalesSupervisorProfile";
import { UserServiceError } from "@/features/users/services/userService";

const getInitials = (firstName: string, lastName?: string | null) =>
  `${firstName.charAt(0)}${lastName?.charAt(0) ?? ""}`.toUpperCase();

const joinName = (...parts: Array<string | null | undefined>) =>
  parts.filter((part): part is string => Boolean(part?.trim())).join(" ");

const errorMessage = (error: unknown, resource: "cuenta" | "perfil") => {
  if (!(error instanceof UserServiceError)) {
    return `No fue posible cargar ${resource === "cuenta" ? "la información de tu cuenta" : "el perfil de supervisor"}.`;
  }

  switch (error.status) {
    case 401:
      return "Tu sesión ya no es válida. Vuelve a iniciar sesión.";
    case 403:
      return "No tienes permiso para consultar esta información.";
    case 404:
      return resource === "cuenta"
        ? "No encontramos la información de tu cuenta."
        : "No encontramos un perfil de supervisor asociado a tu cuenta.";
    default:
      return error.status >= 500
        ? "El servidor no pudo completar la consulta. Inténtalo nuevamente más tarde."
        : error.message;
  }
};

function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6" aria-busy="true" aria-label="Cargando perfil">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-72 max-w-full" />
      </div>
      <Card>
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function SalesSupervisorProfileView() {
  const {
    authenticatedUser,
    hasValidUserId,
    user,
    supervisor,
    userQuery,
    supervisorQuery,
  } = useSalesSupervisorProfile();

  if (!authenticatedUser || !hasValidUserId) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-4xl">
        <UserRound className="h-4 w-4" />
        <AlertTitle>No se pudo cargar tu perfil</AlertTitle>
        <AlertDescription>
          La identidad de tu sesión no contiene un identificador válido. Vuelve a iniciar sesión.
        </AlertDescription>
      </Alert>
    );
  }

  if (userQuery.isLoading) return <ProfileSkeleton />;

  if (userQuery.isError) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-4xl">
        <UserRound className="h-4 w-4" />
        <AlertTitle>Error al cargar la cuenta</AlertTitle>
        <AlertDescription>{errorMessage(userQuery.error, "cuenta")}</AlertDescription>
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-4xl">
        <UserRound className="h-4 w-4" />
        <AlertTitle>Cuenta no encontrada</AlertTitle>
        <AlertDescription>No encontramos información general asociada a tu usuario.</AlertDescription>
      </Alert>
    );
  }

  const fullName = joinName(user.first_name, user.middle_name, user.last_name);
  const roleLabel = translateEnum(user.role.name, RoleTranslationsMap);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mi perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Consulta la información de tu cuenta.
        </p>
      </header>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar className="h-16 w-16 border bg-background">
              <AvatarFallback className="text-lg font-semibold text-primary">
                {getInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="break-words text-xl sm:text-2xl">{fullName}</CardTitle>
              <CardDescription className="mt-1">{roleLabel}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-5 sm:p-6">
          <section aria-labelledby="account-information-title">
            <h2 id="account-information-title" className="text-base font-semibold">
              Información de la cuenta
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-background p-4">
                <dt className="text-sm text-muted-foreground">Nombre</dt>
                <dd className="mt-2 break-words font-medium">{user.first_name}</dd>
              </div>
              {user.middle_name?.trim() && (
                <div className="rounded-lg border bg-background p-4">
                  <dt className="text-sm text-muted-foreground">Segundo nombre</dt>
                  <dd className="mt-2 break-words font-medium">{user.middle_name}</dd>
                </div>
              )}
              <div className="rounded-lg border bg-background p-4">
                <dt className="text-sm text-muted-foreground">Apellido</dt>
                <dd className="mt-2 break-words font-medium">{user.last_name}</dd>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Correo
                </dt>
                <dd className="mt-2 break-all font-medium">{user.email}</dd>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                  Rol
                </dt>
                <dd className="mt-2 font-medium">{roleLabel}</dd>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <dt className="text-sm text-muted-foreground">Estado</dt>
                <dd className="mt-2">
                  <Badge variant={user.is_active ? "secondary" : "outline"}>
                    {user.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </dd>
              </div>
            </dl>
          </section>

          <section className="border-t pt-6" aria-labelledby="supervisor-profile-title">
            <h2 id="supervisor-profile-title" className="text-base font-semibold">
              Perfil de supervisor
            </h2>

            {supervisorQuery.isLoading ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2" aria-label="Cargando perfil de supervisor">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : supervisorQuery.isError ? (
              <Alert variant="destructive" className="mt-4">
                <CircleDollarSign className="h-4 w-4" />
                <AlertTitle>Error al cargar el perfil de supervisor</AlertTitle>
                <AlertDescription>{errorMessage(supervisorQuery.error, "perfil")}</AlertDescription>
              </Alert>
            ) : !supervisor ? (
              <div className="mt-4 rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                No existe un perfil de supervisor asociado a esta cuenta.
              </div>
            ) : (
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-background p-4">
                  <dt className="text-sm text-muted-foreground">Límite de descuento</dt>
                  <dd className="mt-2 font-medium">{supervisor.discount_limit_percent}%</dd>
                </div>
                {supervisor.max_manual_discount !== null && (
                  <div className="rounded-lg border bg-background p-4">
                    <dt className="text-sm text-muted-foreground">Descuento manual máximo</dt>
                    <dd className="mt-2 font-medium">{supervisor.max_manual_discount}</dd>
                  </div>
                )}
              </dl>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
