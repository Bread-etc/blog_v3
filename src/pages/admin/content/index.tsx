import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Delete02Icon,
  PlusSignIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQuery } from "@tanstack/react-query"

import AdminTable from "@/components/admin/AdminTable"
import type { AdminTableColumn } from "@/components/admin/AdminTable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import DeleteContentDialog from "@/pages/admin/content/components/DeleteContentDialog"
import type { DeleteContentTarget } from "@/pages/admin/content/components/DeleteContentDialog"
import PostEditorDialog from "@/pages/admin/content/components/PostEditorDialog"
import TaxonomyEditorDialog from "@/pages/admin/content/components/TaxonomyEditorDialog"
import { getCategories } from "@/services/api/category"
import { getPostList } from "@/services/api/post"
import { getTags } from "@/services/api/tag"
import type { GetCategoriesResponse } from "@/types/category"
import type { GetPostListResponse } from "@/types/post"
import type { GetTagsResponse } from "@/types/tag"

type ContentTab = "posts" | "categories" | "tags"
type TaxonomyType = "category" | "tag"

type CategoryRow = GetCategoriesResponse[number]
type TagRow = GetTagsResponse[number]
type PostRow = GetPostListResponse["list"][number]
type TaxonomyRow = CategoryRow | TagRow

const CONTENT_TABS = ["posts", "categories", "tags"] as const
const PAGE_SIZE = 10

function formatDate(value: string) {
  const [date] = value.split("T")
  return date || value
}

export default function Content() {
  const { t } = useTranslation()

  const [activeTab, setActiveTab] = useState<ContentTab>("posts")
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [keyword, setKeyword] = useState("")
  const [postDialogOpen, setPostDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<PostRow | null>(null)
  const [taxonomyDialogOpen, setTaxonomyDialogOpen] = useState(false)
  const [taxonomyType, setTaxonomyType] = useState<TaxonomyType>("category")
  const [editingTaxonomy, setEditingTaxonomy] = useState<TaxonomyRow | null>(
    null
  )
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DeleteContentTarget | null>(
    null
  )

  // 网络请求
  const postsQuery = useQuery({
    queryKey: ["posts", { page, pageSize: PAGE_SIZE, keyword }],
    queryFn: () =>
      getPostList({
        page,
        pageSize: PAGE_SIZE,
        keyword: keyword || undefined,
      }),
    enabled: activeTab === "posts",
  })
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: activeTab === "categories",
  })
  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
    enabled: activeTab === "tags",
  })

  // Variables
  const posts = postsQuery.data?.list ?? []
  const categories = categoriesQuery.data ?? []
  const tags = tagsQuery.data ?? []
  const totalPosts = postsQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalPosts / PAGE_SIZE))

  useEffect(() => {
    if (postsQuery.data && page > totalPages) {
      setPage(totalPages)
    }
  }, [page, postsQuery.data, totalPages])

  // Functions
  function handleTabChange(tab: ContentTab) {
    setActiveTab(tab)
  }

  function handleCreate() {
    if (activeTab === "posts") {
      setEditingPost(null)
      setPostDialogOpen(true)
      return
    }

    setTaxonomyType(activeTab === "categories" ? "category" : "tag")
    setEditingTaxonomy(null)
    setTaxonomyDialogOpen(true)
  }

  function handleEditPost(row: PostRow) {
    setEditingPost(row)
    setPostDialogOpen(true)
  }

  function handlePostDialogOpenChange(open: boolean) {
    setPostDialogOpen(open)
  }

  function handleEditTaxonomy(type: TaxonomyType, row: TaxonomyRow) {
    setTaxonomyType(type)
    setEditingTaxonomy(row)
    setTaxonomyDialogOpen(true)
  }

  function handleTaxonomyDialogOpenChange(open: boolean) {
    setTaxonomyDialogOpen(open)
  }

  function handleDelete(target: DeleteContentTarget) {
    setDeleteTarget(target)
    setDeleteDialogOpen(true)
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    setDeleteDialogOpen(open)
  }

  const postColumns: AdminTableColumn<PostRow>[] = [
    {
      key: "title",
      title: t("auth.content.columns.title"),
      width: "35%",
      render: (row) => (
        <button
          type="button"
          className="max-w-sm truncate font-medium text-foreground transition-colors hover:text-primary hover:underline"
          onClick={() => handleEditPost(row)}
        >
          {row.title}
        </button>
      ),
    },
    {
      key: "category",
      title: t("auth.content.columns.category"),
      render: (row) =>
        row.category.name ? (
          <span className="rounded-full border border-primary bg-primary/10 px-2 py-0.5 text-xs text-primary">
            {row.category.name}
          </span>
        ) : (
          <span>--</span>
        ),
    },
    {
      key: "slug",
      title: t("auth.content.columns.slug"),
      render: (row) => (
        <span className="block max-w-40 truncate font-medium text-muted-foreground">
          /{row.slug}
        </span>
      ),
    },
    {
      key: "views",
      title: t("auth.content.columns.views"),
      render: (row) => (
        <span className="text-muted-foreground tabular-nums">
          {row.views.toLocaleString()}
        </span>
      ),
    },
    {
      key: "isPublished",
      title: t("auth.content.columns.status"),
      render: (row) => (
        <span
          className={
            row.isPublished
              ? "rounded-sm bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
              : "rounded-sm bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
          }
        >
          {row.isPublished
            ? t("auth.content.status.published")
            : t("auth.content.status.draft")}
        </span>
      ),
    },
    {
      key: "createdAt",
      title: t("auth.content.columns.createdAt"),
      render: (row) => (
        <span className="text-muted-foreground">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      title: t("auth.content.columns.actions"),
      align: "right",
      render: (row) => (
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={t("auth.content.actions.delete")}
          onClick={() =>
            handleDelete({
              id: row.id,
              type: "post",
              label: row.title,
              slug: row.slug,
            })
          }
        >
          <HugeiconsIcon icon={Delete02Icon} className="size-4.5" />
        </Button>
      ),
    },
  ]

  const taxonomyColumns: AdminTableColumn<TaxonomyRow>[] = [
    {
      key: "name",
      title: t("auth.content.columns.name"),
      width: "45%",
      render: (row) => (
        <button
          type="button"
          className="max-w-md truncate font-medium text-foreground transition-colors hover:text-primary hover:underline"
          onClick={() =>
            handleEditTaxonomy(
              activeTab === "categories" ? "category" : "tag",
              row
            )
          }
        >
          {row.name}
        </button>
      ),
    },
    {
      key: "slug",
      title: t("auth.content.columns.slug"),
      render: (row) => (
        <span className="block max-w-40 truncate font-medium text-muted-foreground">
          {row.slug}
        </span>
      ),
    },
    {
      key: "actions",
      title: t("auth.content.columns.actions"),
      align: "right",
      render: (row) => (
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={t("auth.content.actions.delete")}
          onClick={() =>
            handleDelete({
              id: row.id,
              type: activeTab === "categories" ? "category" : "tag",
              label: row.name,
            })
          }
        >
          <HugeiconsIcon icon={Delete02Icon} className="size-4.5" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            {t("auth.content.title")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("auth.content.description")}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="inline-flex gap-1 rounded-md bg-muted p-1">
            {CONTENT_TABS.map((tab) => (
              <Button
                key={tab}
                className={`h-6 rounded-sm border-none px-3 text-xs transition-colors ${
                  activeTab === tab
                    ? "bg-background text-foreground hover:bg-background"
                    : "bg-muted text-muted-foreground hover:bg-background/90 hover:text-foreground"
                }`}
                onClick={() => handleTabChange(tab)}
              >
                {t(`auth.content.tabs.${tab}`)}
              </Button>
            ))}
          </div>

          <Button className="rounded-sm" onClick={handleCreate}>
            <HugeiconsIcon icon={PlusSignIcon} className="size-4 h-6" />
            {t("auth.content.actions.add")}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-end">
          {activeTab === "posts" ? (
            <form
              className="relative w-full sm:w-80"
              onSubmit={(event) => {
                event.preventDefault()
                setPage(1)
                setKeyword(searchInput.trim())
              }}
            >
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                type="search"
                value={searchInput}
                placeholder={t("auth.content.searchPlaceholder")}
                maxLength={100}
                className="border-2 pl-8 focus-visible:ring-2"
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </form>
          ) : null}
        </div>

        {activeTab === "posts" ? (
          <AdminTable
            rows={posts}
            columns={postColumns}
            rowKey="id"
            loading={postsQuery.isPending}
            error={postsQuery.isError && !postsQuery.data}
            emptyText={t("common.table.emptyTitle")}
            errorText={t("auth.content.loadFailed")}
            onRetry={() => void postsQuery.refetch()}
          />
        ) : null}

        {activeTab === "categories" ? (
          <AdminTable
            rows={categories}
            columns={taxonomyColumns}
            rowKey="id"
            loading={categoriesQuery.isPending}
            error={categoriesQuery.isError && !categoriesQuery.data}
            emptyText={t("common.table.emptyTitle")}
            errorText={t("auth.content.loadFailed")}
            onRetry={() => void categoriesQuery.refetch()}
          />
        ) : null}

        {activeTab === "tags" ? (
          <AdminTable
            rows={tags}
            columns={taxonomyColumns}
            rowKey="id"
            loading={tagsQuery.isPending}
            error={tagsQuery.isError && !tagsQuery.data}
            emptyText={t("common.table.emptyTitle")}
            errorText={t("auth.content.loadFailed")}
            onRetry={() => void tagsQuery.refetch()}
          />
        ) : null}

        {activeTab === "posts" ? (
          <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={t("common.pagination.previous")}
              disabled={page <= 1 || postsQuery.isPending}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            </Button>
            <span className="tabular-nums">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={t("common.pagination.next")}
              disabled={page >= totalPages || postsQuery.isPending}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>

      <PostEditorDialog
        open={postDialogOpen}
        item={editingPost}
        onOpenChange={handlePostDialogOpenChange}
      />

      <TaxonomyEditorDialog
        open={taxonomyDialogOpen}
        type={taxonomyType}
        item={editingTaxonomy}
        onOpenChange={handleTaxonomyDialogOpenChange}
      />

      <DeleteContentDialog
        open={deleteDialogOpen}
        target={deleteTarget}
        onOpenChange={handleDeleteDialogOpenChange}
      />
    </div>
  )
}
