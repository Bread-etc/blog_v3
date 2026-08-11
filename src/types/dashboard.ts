interface StatsItem {
  total: number
  moMGrowth: number
}

interface TopPostItem {
  id: string
  title: string
  views: number
  createdAt: string
}

// ===== 导出接口类型 =====

export interface StatsResponse {
  posts: StatsItem
  categories: StatsItem
  tags: StatsItem
  links: StatsItem
  totalViews: number
}

export interface TopPostsRequest {
  // 1-10，默认为 5
  limit: number
}

export interface TopPostsResponse extends Array<TopPostItem> {}
