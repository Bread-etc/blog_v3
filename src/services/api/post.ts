import { http } from "@/services/http/client"
import type {
  CreatePostRequest,
  CreatePostResponse,
  DeletePostRequest,
  DeletePostResponse,
  GetPostDetailRequest,
  GetPostDetailResponse,
  GetPostListRequest,
  GetPostListResponse,
  IncrementPostViewRequest,
  IncrementPostViewResponse,
  UpdatePostRequest,
  UpdatePostResponse,
} from "@/types/post"

const url = "/posts"

export function getPostList(params: GetPostListRequest) {
  return http.get<GetPostListResponse>(url, { params })
}

export function getPostDetail(payload: GetPostDetailRequest) {
  return http.get<GetPostDetailResponse>(`${url}/${payload.slug}`)
}

export function incrementPostView(payload: IncrementPostViewRequest) {
  return http.post<IncrementPostViewResponse>(`${url}/${payload.id}/views`)
}

export function createPost(payload: CreatePostRequest) {
  return http.post<CreatePostResponse>(url, payload)
}

export function updatePost(payload: UpdatePostRequest) {
  const { id, ...data } = payload

  return http.put<UpdatePostResponse>(`${url}/${id}`, data)
}

export function deletePost(payload: DeletePostRequest) {
  return http.delete<DeletePostResponse>(`${url}/${payload.id}`)
}
