import { http } from "@/services/http/client"
import type {
  CreateCategoryRequest,
  CreateCategoryResponse,
  DeleteCategoryRequest,
  DeleteCategoryResponse,
  GetCategoriesResponse,
  UpdateCategoryRequest,
  UpdateCategoryResponse,
} from "@/types/category"

const url = "/categories"

export function getCategories() {
  return http.get<GetCategoriesResponse>(url)
}

export function createCategory(payload: CreateCategoryRequest) {
  return http.post<CreateCategoryResponse>(url, payload)
}

export function updateCategory(payload: UpdateCategoryRequest) {
  const { id, ...data } = payload

  return http.put<UpdateCategoryResponse>(`${url}/${id}`, data)
}

export function deleteCategory(payload: DeleteCategoryRequest) {
  return http.delete<DeleteCategoryResponse>(`${url}/${payload.id}`)
}
