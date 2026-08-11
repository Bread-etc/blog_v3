interface CategoryItem {
  id: string
  name: string
  slug: string
}

interface TagItem {
  id: string
  name: string
  slug: string
}

interface Post {
  id: string
  title: string
  summary: string
  slug: string
  cover: string
  views: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
  category: CategoryItem
  tags: TagItem[]
}

// ===== 导出接口类型 =====

export interface GetPostListRequest {
  // 默认 1，最小 1
  page?: number
  // 默认 10，范围 1 - 50
  pageSize?: number
  // 关键词，最长 100
  keyword?: string
  // 分类 ID
  categoryId?: string
  // 标签 ID 列表，支持重复参数和 CSV
  tagIds?: string
  // 是否发布
  isPublished?: boolean
}

export interface GetPostListResponse {
  list: Post[]
  total: number
  page: number
  pageSize: number
}

export interface GetPostDetailRequest {
  slug: string
}

export interface GetPostDetailResponse extends Post {
  content: string
}

export interface IncrementPostViewRequest {
  id: string
}

export interface IncrementPostViewResponse {}

export interface CreatePostRequest {
  title: string
  content: string
  summary: string
  slug: string
  cover: string
  categoryId: string
  tagIds: string[]
  isPublished: boolean
}

export interface CreatePostResponse extends GetPostDetailResponse {}

export interface UpdatePostRequest extends CreatePostRequest {
  id: string
}

export interface UpdatePostResponse extends GetPostDetailResponse {}

export interface DeletePostRequest {
  id: string
}

export interface DeletePostResponse {}
