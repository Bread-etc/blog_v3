import { useTranslation } from "react-i18next"

import { Calendar03Icon, Tag01Icon, ViewIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@/lib/utils"
import type { GetPostDetailResponse } from "@/types/post"

type PostMetadataData = Pick<
  GetPostDetailResponse,
  "category" | "createdAt" | "tags" | "views"
>

interface PostMetadataProps {
  post: PostMetadataData
  className?: string
}

export default function PostMetadata({ post, className }: PostMetadataProps) {
  const { t, i18n } = useTranslation()

  const locale = i18n.resolvedLanguage ?? i18n.language
  const category = post.category.name.trim() || t("post.meta.uncategorized")
  const formattedDate = formatPostDate(post.createdAt, locale)
  const formattedViews = new Intl.NumberFormat(locale).format(post.views)

  const tags = post.tags
    .map((tag) => ({
      id: tag.id,
      name: tag.name.trim(),
    }))
    .filter((tag) => tag.name)

  return (
    <div
      className={cn(
        "min-w-0 border-t border-border pt-4 text-sm text-muted-foreground",
        className
      )}
    >
      <ul className="space-y-4">
        <li className="flex min-w-0 items-center gap-2">
          <HugeiconsIcon
            icon={Calendar03Icon}
            className="size-4 shrink-0"
            aria-hidden="true"
          />

          <time className="min-w-0 wrap-anywhere" dateTime={post.createdAt}>
            {formattedDate}
          </time>
        </li>

        <li
          className="flex min-w-0 items-center gap-2"
          aria-label={t("post.meta.views", {
            value: formattedViews,
          })}
        >
          <HugeiconsIcon
            icon={ViewIcon}
            className="size-4 shrink-0"
            aria-hidden="true"
          />
          <span aria-hidden="true">{formattedViews}</span>
        </li>

        <li className="flex min-w-0 items-start gap-2">
          <HugeiconsIcon
            icon={Tag01Icon}
            className="mt-1 size-4 shrink-0"
            aria-hidden="true"
          />

          <div className="flex min-w-0 flex-1 flex-wrap gap-2">
            <span className="inline-flex max-w-full rounded-sm bg-primary/10 px-2 py-1 text-xs font-medium wrap-anywhere text-primary">
              {category}
            </span>

            {tags.length > 0 ? (
              <ul
                aria-label={t("post.meta.tags")}
                className="flex min-w-0 flex-wrap gap-2"
              >
                {tags.map((tag) => (
                  <li key={tag.id} className="min-w-0">
                    <span className="inline-flex max-w-full rounded-sm bg-muted px-2 py-1 text-xs wrap-anywhere text-foreground">
                      #{tag.name}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </li>
      </ul>
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
    month: "long",
    day: "numeric",
  }).format(date)
}
