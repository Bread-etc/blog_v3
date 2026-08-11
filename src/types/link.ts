interface LinkItem {
  id: string
  name: string
  url: string
  description: string
  sort: number
}

// ===== 导出接口类型 =====

export interface GetLinkListRequest {}

export interface GetLinkListResponse extends Array<LinkItem> {}

export interface CreateLinkRequest {
  // 最大长度为 50
  name: string
  // 必须为 URL，最大长度为 255
  url: string
  // 最大长度为 255
  description: string
  // 最小为 0，数字越大越靠前
  sort: number
}

export interface CreateLinkResponse extends LinkItem {}

export interface UpdateLinkRequest extends CreateLinkRequest {
  id: string
}

export interface UpdateLinkResponse {}

export interface DeleteLinkRequest {
  id: string
}

export interface DeleteLinkResponse {}
