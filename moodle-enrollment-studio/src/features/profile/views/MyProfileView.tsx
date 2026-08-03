import { UserRound } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/core/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/core/components/ui/card";
import { Skeleton } from "@/core/components/ui/skeleton";
import { AccountInformationCard } from "../components/AccountInformationCard";
import { SellerProfileCard } from "../components/SellerProfileCard";
import { SupervisorProfileCard } from "../components/SupervisorProfileCard";
import { useMyProfile } from "../hooks/useMyProfile";

function ProfileSkeleton() {
  return (
    <Card aria-busy="true" aria-label="Cargando perfil">
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
  );
}

function ProfileAlert({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <Alert variant="destructive">
      <UserRound className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export default function MyProfileView() {
  const profile = useMyProfile();

  let content;

  if (profile.isSessionLoading) {
    content = <ProfileSkeleton />;
  } else if (!profile.hasAuthenticatedUser || !profile.hasValidUserId) {
    content = (
      <ProfileAlert
        title="No se pudo cargar tu perfil"
        message="La identidad de tu sesión no contiene un identificador válido. Vuelve a iniciar sesión."
      />
    );
  } else if (!profile.isSupportedRole) {
    content = (
      <ProfileAlert
        title="Rol no compatible"
        message="Tu rol actual no dispone de una vista de perfil."
      />
    );
  } else if (profile.isAccountLoading) {
    content = <ProfileSkeleton />;
  } else if (profile.accountError) {
    content = (
      <ProfileAlert title="Error al cargar la cuenta" message={profile.accountError} />
    );
  } else if (profile.isAccountMissing || !profile.data) {
    content = (
      <ProfileAlert
        title="Cuenta no encontrada"
        message="No encontramos información general asociada a tu usuario."
      />
    );
  } else {
    content = (
      <>
        <AccountInformationCard account={profile.data.account} />

        {profile.isSpecificProfileLoading ? (
          <ProfileSkeleton />
        ) : profile.specificProfileError ? (
          <ProfileAlert
            title={`Error al cargar el perfil de ${
              profile.role === "SALES_REP" ? "vendedor" : "supervisor"
            }`}
            message={profile.specificProfileError}
          />
        ) : profile.isSpecificProfileMissing ? (
          <Alert>
            <UserRound className="h-4 w-4" />
            <AlertTitle>Perfil específico no encontrado</AlertTitle>
            <AlertDescription>
              No existe un perfil de{" "}
              {profile.role === "SALES_REP" ? "vendedor" : "supervisor"} asociado
              a esta cuenta.
            </AlertDescription>
          </Alert>
        ) : profile.data.supervisor ? (
          <SupervisorProfileCard profile={profile.data.supervisor} />
        ) : profile.data.seller ? (
          <SellerProfileCard profile={profile.data.seller} />
        ) : null}
      </>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mi perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Consulta la información de tu cuenta.
        </p>
      </header>
      {content}
    </div>
  );
}

