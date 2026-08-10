export const courseKeys = {
  all: ["courses"] as const,
  lists: () => [...courseKeys.all, "list"] as const,
  list: () => [...courseKeys.lists()] as const,
  details: () => [...courseKeys.all, "detail"] as const,
  detail: (courseId: string) => [...courseKeys.details(), courseId] as const,
};

export const editionKeys = {
  all: ["editions"] as const,
  lists: () => [...editionKeys.all, "list"] as const,
  list: () => [...editionKeys.lists()] as const,
  details: () => [...editionKeys.all, "detail"] as const,
  detail: (editionId: string) => [...editionKeys.details(), editionId] as const,
};

export const professorKeys = {
  all: ["professors"] as const,
  lists: () => [...professorKeys.all, "list"] as const,
  list: () => [...professorKeys.lists()] as const,
  details: () => [...professorKeys.all, "detail"] as const,
  detail: (professorId: string) =>
    [...professorKeys.details(), professorId] as const,
};
