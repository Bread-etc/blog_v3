import { http } from "@/services/http/client"
import type {
  GetSiteConfigResponse,
  UpdateSiteConfigRequest,
  UpdateSiteConfigResponse,
} from "@/types/site"

const url = "/config"

export function getSiteConfig() {
  return http.get<GetSiteConfigResponse>(url)
}

export function updateSiteConfig(payload: UpdateSiteConfigRequest) {
  return http.put<UpdateSiteConfigResponse>(url, payload)
}
