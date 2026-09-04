export interface AppEnv {
  apiBaseUrl: string
  siteName: string
}

export const env: AppEnv = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  siteName: import.meta.env.VITE_SITE_NAME ?? "Blog",
}
