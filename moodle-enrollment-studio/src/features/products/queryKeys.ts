export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: () => [...productKeys.lists()] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (productId: string) => [...productKeys.details(), productId] as const,
};

const createCatalogKeys = <TRoot extends string>(root: TRoot) => ({
  all: [root] as const,
  lists: () => [root, "list"] as const,
  list: () => [root, "list"] as const,
  details: () => [root, "detail"] as const,
  detail: (id: string) => [root, "detail", id] as const,
});

export const categoryKeys = createCatalogKeys("product-categories");
export const benefitKeys = createCatalogKeys("benefits");
export const faqKeys = createCatalogKeys("faqs");
export const certificationKeys = createCatalogKeys("certifications");
