interface TagItem {
  id: string
  name: string
  slug: string
}

// ===== 导出接口类型 =====

export interface GetTagsResponse extends Array<TagItem> {}

export interface CreateTagRequest {
  name: string
  slug: string
}

export interface CreateTagResponse extends TagItem {}

export interface UpdateTagRequest extends CreateTagRequest {
  id: string
}

export interface UpdateTagResponse {}

export interface DeleteTagRequest {
  id: string
}

export interface DeleteTagResponse {}
