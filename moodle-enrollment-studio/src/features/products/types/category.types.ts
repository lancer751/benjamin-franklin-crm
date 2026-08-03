export interface ProductCategory {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCategoryPayload {
  name: string;
}

export interface UpdateCategoryPayload {
  name: string;
}

export interface CategoryMutationVariables {
  id: string;
  payload: UpdateCategoryPayload;
}
