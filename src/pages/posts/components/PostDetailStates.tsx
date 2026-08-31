import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import {
  ArrowReloadHorizontalIcon,
  FileExclamationPointIcon,
  FileNotFoundIcon,
  Home01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface PostDetailStateProps {
  variant: "error" | "notFound"
  onRetry?: () => void
}

export function PostDetailState({ variant, onRetry }: PostDetailStateProps) {
  const { t } = useTranslation()
  const isError = variant === "error"

  const title = isError ? t("post.error.title") : t("post.notFound.title")
  const description = isError
    ? t("post.error.description")
    : t("post.notFound.description")

  return (
    <div
      role={isError ? "alert" : undefined}
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center"
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <HugeiconsIcon
          icon={isError ? FileExclamationPointIcon : FileNotFoundIcon}
          className="size-5"
          aria-hidden="true"
        />
      </div>

      <h1 className="mt-4 text-lg font-semibold">{title}</h1>
      <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {isError && onRetry ? (
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={onRetry}
        >
          <HugeiconsIcon
            icon={ArrowReloadHorizontalIcon}
            className="size-4"
            aria-hidden="true"
          />
          {t("common.retry")}
        </Button>
      ) : null}

      {!isError ? (
        <Button asChild variant="outline" className="mt-4">
          <Link to="/">
            <HugeiconsIcon
              icon={Home01Icon}
              className="size-4"
              aria-hidden="true"
            />
            {t("post.notFound.backHome")}
          </Link>
        </Button>
      ) : null}
    </div>
  )
}

export function PostDetailSkeleton() {
  const { t } = useTranslation()

  return (
    <div
      role="status"
      aria-busy="true"
      className="mx-auto w-full py-8 sm:py-10"
    >
      <span className="sr-only">{t("post.loading")}</span>

      <div aria-hidden="true">
        <header className="mx-auto max-w-3xl text-center">
          <Skeleton className="mx-auto h-10 w-11/12 max-w-2xl sm:h-12" />
          <Skeleton className="mx-auto mt-3 h-10 w-3/4 max-w-xl sm:h-12" />

          <div className="mx-auto mt-5 max-w-2xl space-y-2">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="mx-auto h-5 w-5/6" />
          </div>
        </header>

        <div className="mx-auto mt-8 max-w-5xl min-w-0 lg:grid lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-10">
          <aside className="mb-6 min-w-0 lg:col-start-2 lg:row-start-1 lg:mb-0">
            <div className="border-y border-border py-4 lg:sticky lg:top-28 lg:border-y-0 lg:py-0">
              <div className="hidden space-y-3 lg:block">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="ml-3 h-4 w-4/5" />
                <Skeleton className="h-4 w-11/12" />
              </div>

              <div className="flex flex-wrap items-center gap-4 lg:mt-4 lg:block lg:space-y-4 lg:border-t lg:border-border lg:pt-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />

                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 shrink-0" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-14" />
                </div>
              </div>
            </div>
          </aside>

          <div className="min-w-0 space-y-8 lg:col-start-1 lg:row-start-1">
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            <Skeleton className="aspect-video w-full rounded-lg" />

            <div className="space-y-4">
              <Skeleton className="h-8 w-2/5" />

              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            <Skeleton className="h-28 w-full rounded-md" />

            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />

              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
