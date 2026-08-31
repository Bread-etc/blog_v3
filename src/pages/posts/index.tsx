import { useEffect, useMemo, useRef, type SyntheticEvent } from "react"
import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"

import { useMutation, useQuery } from "@tanstack/react-query"

import defaultCover from "@/assets/images/default_cover.webp"
import { cn } from "@/lib/utils"
import { getPostDetail, incrementPostView } from "@/services/api/post"
import { HttpError } from "@/services/http/client"

import MarkdownContent from "./components/MarkdownContent"
import {
  PostDetailSkeleton,
  PostDetailState,
} from "./components/PostDetailStates"
import PostMetadata from "./components/PostMetadata"
import TableOfContents from "./components/TableOfContents"
import { extractMarkdownHeadings } from "./markdown"

export default function PostDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>()
  const { t } = useTranslation()
  const viewedPostId = useRef<string | null>(null)

  const postQuery = useQuery({
    queryKey: ["post", "detail", slug],
    queryFn: () => getPostDetail({ slug }),
    enabled: Boolean(slug),
    retry(failureCount, error) {
      return !isPostNotFound(error) && failureCount < 1
    },
  })
  const { mutate: incrementView } = useMutation({
    mutationFn: incrementPostView,
  })

  const post = postQuery.data
  const postId = post?.id ?? ""
  const content = post?.content ?? ""

  const headings = useMemo(() => extractMarkdownHeadings(content), [content])

  useEffect(() => {
    if (window.location.hash) {
      return
    }

    window.scrollTo({
      top: 0,
      behavior: "auto",
    })
  }, [slug])

  useEffect(() => {
    if (!postId || viewedPostId.current === postId) {
      return
    }

    viewedPostId.current = postId
    incrementView({ id: postId })
  }, [incrementView, postId])

  if (!slug || isPostNotFound(postQuery.error)) {
    return <PostDetailState variant="notFound" />
  }

  if (postQuery.isPending) {
    return <PostDetailSkeleton />
  }

  if (!post) {
    return (
      <PostDetailState
        variant="error"
        onRetry={() => void postQuery.refetch()}
      />
    )
  }

  const summary = post.summary.trim()
  const titleId = `post-title-${post.id}`
  const hasHeadings = headings.length > 0

  return (
    <div className="mx-auto w-full min-w-0 pb-12 sm:pb-16">
      <header
        className="mx-auto max-w-4xl min-w-0 pt-8 text-center sm:pt-10"
        aria-labelledby={titleId}
      >
        <h1
          id={titleId}
          className="text-3xl font-semibold wrap-anywhere lg:text-4xl"
        >
          {post.title}
        </h1>

        {summary ? (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 wrap-anywhere text-muted-foreground sm:text-lg sm:leading-8">
            {summary}
          </p>
        ) : null}
      </header>

      <div className="mx-auto mt-8 max-w-5xl min-w-0 lg:grid lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-10">
        <div className="mb-6 min-w-0 lg:sticky lg:top-28 lg:col-start-2 lg:row-start-1 lg:mb-0 lg:flex lg:max-h-[calc(100vh-8rem)] lg:flex-col lg:self-start">
          <TableOfContents
            headings={headings}
            className="static top-auto hidden max-h-none min-h-0 lg:block lg:overflow-y-auto"
          />

          <PostMetadata
            post={post}
            className={cn(
              "shrink-0 border-y py-4 lg:border-b-0 lg:pb-0",
              hasHeadings ? "lg:mt-4" : "lg:border-t-0 lg:pt-0"
            )}
          />
        </div>

        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <div className="aspect-video overflow-hidden rounded-lg bg-muted">
            <img
              src={post.cover.trim() || defaultCover}
              alt={t("post.coverAlt", {
                title: post.title,
              })}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onError={handleCoverError}
              className="size-full object-cover"
            />
          </div>

          <MarkdownContent content={content} className="mt-8" />
        </div>
      </div>
    </div>
  )
}

function isPostNotFound(error: unknown) {
  return (
    error instanceof HttpError &&
    (error.status === 404 ||
      error.code === 404 ||
      error.errorCode === "POST_NOT_FOUND")
  )
}

function handleCoverError(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget

  if (image.dataset.fallbackApplied === "true") {
    return
  }

  image.dataset.fallbackApplied = "true"
  image.src = defaultCover
}
