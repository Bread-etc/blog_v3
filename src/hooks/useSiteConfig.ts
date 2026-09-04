import { useQuery } from "@tanstack/react-query"

import { getSiteConfig } from "@/services/api/site"

export const SITE_CONFIG_QUERY_KEY = ["config"] as const

export function useSiteConfig() {
  return useQuery({
    queryKey: SITE_CONFIG_QUERY_KEY,
    queryFn: getSiteConfig,
    // 新鲜时间 = 60 分钟
    staleTime: 60 * 60 * 1000,
  })
}
