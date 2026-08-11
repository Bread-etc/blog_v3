import { useTranslation } from "react-i18next"

import { Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import type { I18nKey } from "@/i18n/types"

interface AppLoadingProps {
  variant?: "public" | "admin"
}

export default function AppLoading({ variant = "public" }: AppLoadingProps) {
  const { t } = useTranslation()

  const titleKey: I18nKey =
    variant === "admin" ? "common.admin.title" : "common.public.title"
  const descriptionKey: I18nKey =
    variant === "admin"
      ? "common.admin.description"
      : "common.public.description"

  return (
    <div className="flex-center min-h-[60vh] p-4">
      <div className="flex-center w-full max-w-md flex-col">
        <div className="flex items-center gap-2">
          <div className="flex-center size-8 rounded-lg border border-border bg-card text-primary">
            <HugeiconsIcon
              icon={Loading03Icon}
              className="size-4 animate-spin"
            />
          </div>
          <h2 className="text-base font-medium text-foreground">
            {t(titleKey)}
          </h2>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {t(descriptionKey)}
        </p>
      </div>
    </div>
  )
}
