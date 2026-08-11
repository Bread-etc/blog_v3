import { http } from "@/services/http/client"
import type {
  CreateTagRequest,
  CreateTagResponse,
  DeleteTagRequest,
  DeleteTagResponse,
  GetTagsResponse,
  UpdateTagRequest,
  UpdateTagResponse,
} from "@/types/tag"

const url = "/tags"

export function getTags() {
  return http.get<GetTagsResponse>(url)
}

export function createTag(payload: CreateTagRequest) {
  return http.post<CreateTagResponse>(url, payload)
}

export function updateTag(payload: UpdateTagRequest) {
  const { id, ...data } = payload

  return http.put<UpdateTagResponse>(`${url}/${id}`, data)
}

export function deleteTag(payload: DeleteTagRequest) {
  return http.delete<DeleteTagResponse>(`${url}/${payload.id}`)
}
