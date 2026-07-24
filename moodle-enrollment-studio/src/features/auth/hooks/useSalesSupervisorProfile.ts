import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { getSupervisorById, getUserById } from "@/features/users/services/userService";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isValidProfileUserId = (value?: string): value is string =>
  Boolean(value && UUID_PATTERN.test(value));

export function useSalesSupervisorProfile() {
  const authenticatedUser = useAuthStore((state) => state.user);
  const userId = isValidProfileUserId(authenticatedUser?.id)
    ? authenticatedUser.id
    : undefined;

  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => {
      if (!userId) throw new Error("User ID is required");
      return getUserById(userId);
    },
    enabled: Boolean(userId),
    retry: false,
  });

  const supervisorQuery = useQuery({
    queryKey: ["supervisorProfile", userId],
    queryFn: () => {
      if (!userId) throw new Error("Supervisor user ID is required");
      return getSupervisorById(userId);
    },
    enabled: Boolean(userId),
    retry: false,
  });

  return {
    authenticatedUser,
    userId,
    hasValidUserId: Boolean(userId),
    user: userQuery.data?.data ?? null,
    supervisor: supervisorQuery.data?.data ?? null,
    userQuery,
    supervisorQuery,
  };
}
