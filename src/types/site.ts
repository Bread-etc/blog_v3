export interface SiteConfig {
  title: string
  subtitle: string
  description: string
  keywords: string
  author: string
  email: string
  githubUrl: string
}

// ===== 导出接口类型 =====

export interface GetSiteConfigRequset {}

export interface GetSiteConfigResponse extends SiteConfig {}

export interface UpdateSiteConfigRequest extends SiteConfig {}

export interface UpdateSiteConfigResponse {}
