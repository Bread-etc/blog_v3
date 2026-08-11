import { http } from "@/services/http/client"
import type {
  StatsResponse,
  TopPostsRequest,
  TopPostsResponse,
} from "@/types/dashboard"

const url = "/dashboard"

export function getDashboardStats() {
  return http.get<StatsResponse>(`${url}/stats`)
}

export function getTopPosts(params: TopPostsRequest) {
  return http.get<TopPostsResponse>(`${url}/top-posts`, { params })
}
