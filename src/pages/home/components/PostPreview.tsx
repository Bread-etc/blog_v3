import type { SyntheticEvent } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import { ArrowRight01Icon, ViewIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import defaultCover from "@/assets/images/default_cover.webp"
import { cn } from "@/lib/utils"
import type { GetPostListResponse } from "@/types/post"

type PostItem = GetPostListResponse["list"][number]
type PostPreviewVariant = "featured" | "card"

interface PostPreviewProps {
  post: PostItem
  variant?: PostPreviewVariant
}

export default function PostPreview({
  post,
  variant = "card",
}: PostPreviewProps) {
  const { t, i18n } = useTranslation()

  const featured = variant === "featured"
  const locale = i18n.resolvedLanguage ?? i18n.language
  const summary = post.summary.trim()
  const category = post.category.name.trim() || t("home.meta.uncategorized")
  const titleId = `post-title-${post.id}`

  return (
    <article className="h-full" aria-labelledby={titleId}>
      <Link
        to={`/posts/${encodeURIComponent(post.slug)}`}
        className={cn(
          "group flex h-full overflow-hidden rounded-xl border border-border bg-card ring-0 transition-colors outline-none",
          "hover:border-primary focus-visible:border-ring",
          featured
            ? "flex-col lg:grid lg:min-h-80 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]"
            : "flex-col"
        )}
      >
        <div
          className={cn(
            "overflow-hidden bg-muted",
            featured ? "aspect-16/10 lg:aspect-auto" : "aspect-video"
          )}
        >
          <img
            src={post.cover.trim() || defaultCover}
            alt={t("home.post.coverAlt", { title: post.title })}
            loading={featured ? "eager" : "lazy"}
            fetchPriority={featured ? "high" : undefined}
            decoding="async"
            onError={handleCoverError}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.1]"
          />
        </div>

        <div
          className={cn(
            "flex min-w-0 flex-col",
            featured ? "justify-center p-8" : "min-h-50 flex-1 p-4"
          )}
        >
          {/* 文章元信息 */}
          <PostMeta post={post} category={category} locale={locale} />

          {/* 标题 */}
          {featured ? (
            <h2
              id={titleId}
              className="mt-6 line-clamp-3 text-xl font-semibold wrap-break-word sm:text-2xl"
            >
              {post.title}
            </h2>
          ) : (
            <h3
              id={titleId}
              className="mt-4 line-clamp-2 text-base font-semibold wrap-break-word"
            >
              {post.title}
            </h3>
          )}

          {/* 摘要 */}
          {summary ? (
            <p
              className={cn(
                "wrap-anywhere text-muted-foreground",
                featured
                  ? "mt-4 line-clamp-4 text-base leading-7"
                  : "mt-2 line-clamp-3 text-sm leading-6"
              )}
            >
              {summary}
            </p>
          ) : null}

          {/* 阅读文章入口 */}
          {featured ? (
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
              {t("home.post.readArticle")}

              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          ) : null}
        </div>
      </Link>
    </article>
  )
}

interface PostMetaProps {
  post: PostItem
  category: string
  locale: string
}

function PostMeta({ post, category, locale }: PostMetaProps) {
  const { t } = useTranslation()
  const formattedViews = new Intl.NumberFormat(locale).format(post.views)

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
      {/* 标签 */}
      <span className="inline-flex rounded-sm bg-primary/10 px-2 py-1 font-medium text-primary">
        {category}
      </span>
      {/* 创建时间 */}
      <time dateTime={post.createdAt}>
        {formatPostDate(post.createdAt, locale)}
      </time>
      {/* 浏览量 */}
      <span
        className="inline-flex items-center gap-1.5"
        aria-label={t("home.meta.views", { value: formattedViews })}
      >
        <span aria-hidden="true">·</span>
        <HugeiconsIcon
          icon={ViewIcon}
          className="size-3.5"
          aria-hidden="true"
        />
        <span aria-hidden="true">{formattedViews}</span>
      </span>
    </div>
  )
}

function formatPostDate(value: string, locale: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

function handleCoverError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget

  if (image.dataset.fallbackApplied === "true") {
    return
  }

  image.dataset.fallbackApplied = "true"
  image.src = defaultCover
}
