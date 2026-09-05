import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import {
  ArrowDown01Icon,
  ArrowReloadHorizontalIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useInfiniteQuery } from "@tanstack/react-query"

import { ScrollRestorationReady } from "@/components/layout/PublicScrollRestoration"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getPostList } from "@/services/api/post"
import type { GetPostListRequest, GetPostListResponse } from "@/types/post"

import { ArchiveSkeleton, ArchiveState } from "./components/ArchiveStates"

const ARCHIVE_PAGE_SIZE = 20
const ARCHIVE_TIME_ZONE = "Asia/Shanghai"
const ARCHIVE_YEAR_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  timeZone: ARCHIVE_TIME_ZONE,
})

const ARCHIVE_QUERY_PARAMS = {
  pageSize: ARCHIVE_PAGE_SIZE,
  isPublished: true,
} satisfies GetPostListRequest

const CATEGORY_TONES = [
  "bg-primary/10 text-primary",
  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
] as const

type ArchivePost = GetPostListResponse["list"][number]

interface ArchiveYearGroup {
  year: string
  posts: ArchivePost[]
}

export default function Archive() {
  const { t, i18n } = useTranslation()
  const locale = i18n.resolvedLanguage ?? i18n.language

  // 网络请求
  const postsQuery = useInfiniteQuery({
    queryKey: ["posts", "archive", ARCHIVE_QUERY_PARAMS],
    // 阅读长文章后返回时，仍保留已经加载的归档分页
    gcTime: Infinity,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getPostList({
        ...ARCHIVE_QUERY_PARAMS,
        page: pageParam,
      }),
    getNextPageParam(lastPage) {
      const loadedCount = lastPage.page * lastPage.pageSize

      return loadedCount < lastPage.total ? lastPage.page + 1 : undefined
    },
  })

  // Variables
  const posts = postsQuery.data?.pages.flatMap((page) => page.list) ?? []
  const yearGroups = groupPostsByYear(posts)
  const loadMoreLabel = postsQuery.isFetchingNextPage
    ? t("archive.loadMore.loading")
    : postsQuery.isFetchNextPageError
      ? t("common.retry")
      : t("archive.loadMore.action")

  return (
    <div className="mx-auto w-full">
      <ScrollRestorationReady ready={!postsQuery.isPending} />
      <header className="max-w-2xl">
        <h1 id="archive-heading" className="text-2xl font-semibold">
          {t("archive.title")}
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          {t("archive.description")}
        </p>
      </header>

      <section aria-labelledby="archive-heading">
        {postsQuery.isPending ? (
          <ArchiveSkeleton />
        ) : postsQuery.isError && !postsQuery.data ? (
          <ArchiveState
            variant="error"
            onRetry={() => void postsQuery.refetch()}
          />
        ) : posts.length === 0 ? (
          <ArchiveState variant="empty" />
        ) : (
          <>
            <div className="mt-10 space-y-14">
              {yearGroups.map((group) => (
                <ArchiveYearSection
                  key={group.year}
                  group={group}
                  locale={locale}
                  uncategorizedLabel={t("archive.meta.uncategorized")}
                />
              ))}
            </div>

            {postsQuery.hasNextPage ? (
              <div className="mt-10 flex flex-col items-center">
                {postsQuery.isFetchNextPageError ? (
                  <p
                    id="archive-load-more-error"
                    role="alert"
                    className="mb-4 text-sm text-destructive"
                  >
                    {t("archive.loadMore.error")}
                  </p>
                ) : null}

                <Button
                  type="button"
                  size="lg"
                  disabled={postsQuery.isFetchingNextPage}
                  aria-describedby={
                    postsQuery.isFetchNextPageError
                      ? "archive-load-more-error"
                      : undefined
                  }
                  onClick={() => void postsQuery.fetchNextPage()}
                >
                  <HugeiconsIcon
                    icon={
                      postsQuery.isFetchingNextPage
                        ? Loading03Icon
                        : postsQuery.isFetchNextPageError
                          ? ArrowReloadHorizontalIcon
                          : ArrowDown01Icon
                    }
                    className={cn(
                      "size-4",
                      postsQuery.isFetchingNextPage && "animate-spin"
                    )}
                    aria-hidden="true"
                  />
                  {loadMoreLabel}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  )
}

interface ArchiveYearSectionProps {
  group: ArchiveYearGroup
  locale: string
  uncategorizedLabel: string
}

function ArchiveYearSection({
  group,
  locale,
  uncategorizedLabel,
}: ArchiveYearSectionProps) {
  const headingId = `archive-year-${group.year}`

  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="text-5xl font-semibold text-foreground/30 sm:text-6xl"
      >
        {group.year}
      </h2>

      <ol className="mt-4 space-y-3">
        {group.posts.map((post) => (
          <ArchivePostItem
            key={post.id}
            post={post}
            locale={locale}
            uncategorizedLabel={uncategorizedLabel}
          />
        ))}
      </ol>
    </section>
  )
}

interface ArchivePostItemProps {
  post: ArchivePost
  locale: string
  uncategorizedLabel: string
}

function ArchivePostItem({
  post,
  locale,
  uncategorizedLabel,
}: ArchivePostItemProps) {
  const category = post.category.name.trim() || uncategorizedLabel
  const categorySeed = post.category.slug.trim() || post.category.id || category

  return (
    <li>
      <Link
        to={`/posts/${encodeURIComponent(post.slug)}`}
        className={cn(
          "group flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-card p-4",
          "transition-colors outline-none hover:border-primary",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
          "sm:grid sm:h-17 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4 sm:px-6"
        )}
      >
        <time
          dateTime={post.createdAt}
          className="shrink-0 text-sm text-muted-foreground transition-colors group-hover:text-primary"
        >
          {formatArchiveDate(post.createdAt, locale)}
        </time>

        <h3
          className="line-clamp-2 min-w-0 text-sm font-medium wrap-anywhere transition-colors group-hover:text-primary sm:line-clamp-1 sm:text-base"
          title={post.title}
        >
          {post.title}
        </h3>

        <span
          className={cn(
            "hidden max-w-36 truncate rounded-sm px-2 py-1 text-xs font-medium sm:inline-block",
            getCategoryTone(categorySeed)
          )}
          title={category}
        >
          {category}
        </span>
      </Link>
    </li>
  )
}

function groupPostsByYear(posts: ArchivePost[]): ArchiveYearGroup[] {
  const groups = new Map<string, ArchivePost[]>()

  for (const post of posts) {
    const year = getPostYear(post.createdAt)
    const yearPosts = groups.get(year)

    if (yearPosts) {
      yearPosts.push(post)
    } else {
      groups.set(year, [post])
    }
  }

  return Array.from(groups, ([year, yearPosts]) => ({
    year,
    posts: yearPosts,
  }))
}

// 获取文章年份并格式化
function getPostYear(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return ARCHIVE_YEAR_FORMATTER.format(date)
}

// 本地格式化归档日期
function formatArchiveDate(value: string, locale: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    timeZone: ARCHIVE_TIME_ZONE,
  }).format(date)
}

// 同一种分类获得同一种颜色
function getCategoryTone(value: string) {
  let hash = 0

  for (const character of value) {
    hash = (hash * 31 + (character.codePointAt(0) ?? 0)) >>> 0
  }

  return CATEGORY_TONES[hash % CATEGORY_TONES.length]
}
