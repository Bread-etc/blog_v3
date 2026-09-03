import { useTranslation } from "react-i18next"

import {
  ArrowReloadHorizontalIcon,
  File02Icon,
  FileExclamationPointIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface ArchiveStateProps {
  variant: "error" | "empty"
  onRetry?: () => void
}

export function ArchiveState({ variant, onRetry }: ArchiveStateProps) {
  const { t } = useTranslation()
  const isError = variant === "error"

  const title = isError ? t("archive.error.title") : t("archive.empty.title")
  const description = isError
    ? t("archive.error.description")
    : t("archive.empty.description")

  return (
    <div
      role={isError ? "alert" : undefined}
      className="mt-10 flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 px-6 py-12 text-center"
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <HugeiconsIcon
          icon={isError ? FileExclamationPointIcon : File02Icon}
          className="size-5"
          aria-hidden="true"
        />
      </div>

      <h2 className="mt-4 font-medium">{title}</h2>

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
    </div>
  )
}

export function ArchiveSkeleton() {
  const { t } = useTranslation()

  return (
    <div role="status" className="mt-10">
      <span className="sr-only">{t("archive.loading")}</span>

      <div aria-hidden="true" className="space-y-14">
        {Array.from({ length: 2 }, (_, groupIndex) => (
          <div key={groupIndex}>
            <Skeleton className="h-12 w-28 sm:h-14 sm:w-32" />

            <div className="mt-4 space-y-3">
              {Array.from(
                { length: groupIndex === 0 ? 4 : 3 },
                (_, postIndex) => (
                  <div
                    key={postIndex}
                    className="rounded-lg border border-border bg-card p-4 sm:h-17 sm:px-6"
                  >
                    <div className="flex flex-col gap-2 sm:grid sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
                      <Skeleton className="h-5 w-14" />

                      <Skeleton
                        className={
                          postIndex % 2 === 0 ? "h-5 w-4/5" : "h-5 w-3/5"
                        }
                      />

                      <Skeleton className="hidden h-6 w-16 sm:block" />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
