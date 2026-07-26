import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getSalesSupervisorByUserId,
  getSellerById,
  getUserById,
  UserServiceError,
} from "@/features/users/services/userService";
import {
  isProfileRole,
  mapSalesSupervisorProfile,
  mapSellerProfile,
  mapUserAccountProfile,
} from "../mappers/profileMapper";
import type { MyProfileData } from "../types/profile.types";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isValidProfileUserId = (value?: string): value is string =>
  Boolean(value && UUID_PATTERN.test(value));

const readableError = (
  error: unknown,
  resource: "cuenta" | "supervisor" | "vendedor",
): string => {
  const resourceLabel =
    resource === "cuenta"
      ? "la información de tu cuenta"
      : `el perfil de ${resource}`;

  if (!(error instanceof UserServiceError)) {
    return `No fue posible cargar ${resourceLabel}.`;
  }

  if (error.status === 401) {
    return "Tu sesión ya no es válida. Vuelve a iniciar sesión.";
  }
  if (error.status === 403) {
    return "No tienes permiso para consultar esta información.";
  }
  if (error.status === 404) {
    return resource === "cuenta"
      ? "No encontramos la información de tu cuenta."
      : `No encontramos un perfil de ${resource} asociado a tu cuenta.`;
  }
  if (error.status >= 500) {
    return "El servidor no pudo completar la consulta. Inténtalo nuevamente más tarde.";
  }

  return error.message || `No fue posible cargar ${resourceLabel}.`;
};

export function useMyProfile() {
  const authenticatedUser = useAuthStore((state) => state.user);
  const isSessionLoading = useAuthStore((state) => state.isLoading);
  const authenticatedRole = authenticatedUser?.role?.name;
  const role = isProfileRole(authenticatedRole) ? authenticatedRole : null;
  const userId = isValidProfileUserId(authenticatedUser?.id)
    ? authenticatedUser.id
    : undefined;

  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => {
      if (!userId) throw new Error("Se requiere un identificador de usuario válido.");
      return getUserById(userId);
    },
    enabled: Boolean(userId),
    retry: false,
  });

  const supervisorQuery = useQuery({
    queryKey: ["supervisorProfile", userId],
    queryFn: () => {
      if (!userId) throw new Error("Se requiere un identificador de usuario válido.");
      return getSalesSupervisorByUserId(userId);
    },
    enabled: Boolean(userId) && role === "SALES_SUPERVISOR",
    retry: false,
  });

  const sellerQuery = useQuery({
    queryKey: ["sellerProfile", userId],
    queryFn: () => {
      if (!userId) throw new Error("Se requiere un identificador de usuario válido.");
      return getSellerById(userId);
    },
    enabled: Boolean(userId) && role === "SALES_REP",
    retry: false,
  });

  const data = useMemo<MyProfileData | null>(() => {
    if (!role) return null;

    const account = mapUserAccountProfile(userQuery.data?.data, role);
    if (!account) return null;

    return {
      role,
      account,
      supervisor:
        role === "SALES_SUPERVISOR"
          ? mapSalesSupervisorProfile(supervisorQuery.data?.data)
          : null,
      seller:
        role === "SALES_REP"
          ? mapSellerProfile(sellerQuery.data?.data)
          : null,
    };
  }, [role, sellerQuery.data, supervisorQuery.data, userQuery.data]);

  const isSpecificProfileLoading =
    (role === "SALES_SUPERVISOR" && supervisorQuery.isLoading) ||
    (role === "SALES_REP" && sellerQuery.isLoading);
  const specificProfileError =
    role === "SALES_SUPERVISOR" && supervisorQuery.isError
      ? readableError(supervisorQuery.error, "supervisor")
      : role === "SALES_REP" && sellerQuery.isError
        ? readableError(sellerQuery.error, "vendedor")
        : null;
  const isSpecificProfileMissing =
    Boolean(role && role !== "ADMIN" && !isSpecificProfileLoading && !specificProfileError) &&
    ((role === "SALES_SUPERVISOR" && !data?.supervisor) ||
      (role === "SALES_REP" && !data?.seller));

  return {
    data,
    role,
    isSessionLoading,
    hasAuthenticatedUser: Boolean(authenticatedUser),
    hasValidUserId: Boolean(userId),
    isSupportedRole: Boolean(role),
    isAccountLoading: userQuery.isLoading,
    isSpecificProfileLoading,
    accountError: userQuery.isError
      ? readableError(userQuery.error, "cuenta")
      : null,
    specificProfileError,
    isAccountMissing: Boolean(
      !userQuery.isLoading && !userQuery.isError && userQuery.data && !data?.account,
    ),
    isSpecificProfileMissing,
  };
}

