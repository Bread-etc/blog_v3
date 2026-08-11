import { http } from "@/services/http/client"
import type { DataBaseStatus } from "@/types/health"

const url = "/health"

export function getHealth() {
  return http.get<DataBaseStatus>(url)
}
