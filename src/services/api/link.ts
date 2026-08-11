import { http } from "@/services/http/client"
import type {
  CreateLinkRequest,
  CreateLinkResponse,
  DeleteLinkRequest,
  DeleteLinkResponse,
  GetLinkListResponse,
  UpdateLinkRequest,
  UpdateLinkResponse,
} from "@/types/link"

const url = "/links"

export function getLinks() {
  return http.get<GetLinkListResponse>(url)
}

export function createLink(payload: CreateLinkRequest) {
  return http.post<CreateLinkResponse>(url, payload)
}

export function updateLink(payload: UpdateLinkRequest) {
  const { id, ...data } = payload

  return http.put<UpdateLinkResponse>(`${url}/${id}`, data)
}

export function deleteLink(payload: DeleteLinkRequest) {
  return http.delete<DeleteLinkResponse>(`${url}/${payload.id}`)
}
