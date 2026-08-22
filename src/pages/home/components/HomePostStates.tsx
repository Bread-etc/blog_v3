import { useTranslation } from "react-i18next"

import {
  ArrowReloadHorizontalIcon,
  File02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface PostsStateProps {
  variant: "error" | "empty"
  onRetry?: () => void
}

export function PostsState({ variant, onRetry }: PostsStateProps) {
  const { t } = useTranslation()
  const error = variant === "error"

  const title = error ? t("home.error.title") : t("home.empty.title")
  const description = error
    ? t("home.error.description")
    : t("home.empty.description")

  return (
    <div
      role={error ? "alert" : undefined}
      className="mt-10 flex min-h-80 flex-col items-center justify-center rounded-lg border border-border px-4 text-center"
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <HugeiconsIcon
          icon={File02Icon}
          className="size-5"
          aria-hidden="true"
        />
      </div>

      <h2 className="mt-4 font-medium">{title}</h2>
      <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      {error && onRetry ? (
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
    </div>
  )
}

export function PostsSkeleton() {
  const { t } = useTranslation()

  return (
    <div role="status">
      <span className="sr-only">{t("home.loading")}</span>

      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card lg:grid lg:min-h-80 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <Skeleton className="aspect-16/10 rounded-none lg:aspect-auto" />

        <div className="flex flex-col justify-center p-8">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-14" />
          </div>

          <Skeleton className="mt-6 h-7 w-4/5" />
          <Skeleton className="mt-2 h-7 w-3/5" />

          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <Skeleton className="mt-6 h-5 w-24" />
        </div>
      </div>

      <div className="mt-24">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="mt-3 h-4 w-52" />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <Skeleton className="aspect-video rounded-none" />

              <div className="min-h-50 p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>

                <Skeleton className="mt-4 h-5 w-full" />
                <Skeleton className="mt-2 h-5 w-4/5" />

                <div className="mt-2 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
