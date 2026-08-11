interface CategoryItem {
  id: string
  name: string
  slug: string
}

// ===== 导出接口类型 =====

export interface GetCategoriesResponse extends Array<CategoryItem> {}

export interface CreateCategoryRequest {
  name: string
  slug: string
}

export interface CreateCategoryResponse extends CategoryItem {}

export interface UpdateCategoryRequest extends CreateCategoryRequest {
  id: string
}

export interface UpdateCategoryResponse {}

export interface DeleteCategoryRequest {
  id: string
}

export interface DeleteCategoryResponse {}
