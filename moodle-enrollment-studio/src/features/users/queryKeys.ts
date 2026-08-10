export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: () => [...userKeys.lists()] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (userId: string) => [...userKeys.details(), userId] as const,
};

export const roleKeys = {
  all: ["roles"] as const,
  lists: () => [...roleKeys.all, "list"] as const,
  list: () => [...roleKeys.lists()] as const,
};

export const sellerKeys = {
  all: ["sellers"] as const,
  lists: () => [...sellerKeys.all, "list"] as const,
  list: () => [...sellerKeys.lists()] as const,
  details: () => [...sellerKeys.all, "detail"] as const,
  detail: (userId: string) => [...sellerKeys.details(), userId] as const,
  campaigns: (sellerProfileId: string) =>
    [...sellerKeys.all, "campaigns", sellerProfileId] as const,
};

export const supervisorKeys = {
  all: ["supervisors"] as const,
  lists: () => [...supervisorKeys.all, "list"] as const,
  list: () => [...supervisorKeys.lists()] as const,
  details: () => [...supervisorKeys.all, "detail"] as const,
  detail: (userId: string) => [...supervisorKeys.details(), userId] as const,
};
