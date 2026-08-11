import { useTranslation } from "react-i18next"
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom"

import { Button } from "@/components/ui/button"
import type { I18nKey } from "@/i18n/types"

type ErrorContent = {
  title: I18nKey
  description: I18nKey
}

const ERROR_STATUS_KEYS = {
  400: { title: "error.400.title", description: "error.400.description" },
  401: { title: "error.401.title", description: "error.401.description" },
  403: { title: "error.403.title", description: "error.403.description" },
  404: { title: "error.404.title", description: "error.404.description" },
  405: { title: "error.405.title", description: "error.405.description" },
  408: { title: "error.408.title", description: "error.408.description" },
  429: { title: "error.429.title", description: "error.429.description" },
  500: { title: "error.500.title", description: "error.500.description" },
  502: { title: "error.502.title", description: "error.502.description" },
  503: { title: "error.503.title", description: "error.503.description" },
  504: { title: "error.504.title", description: "error.504.description" },
} as const satisfies Record<number, ErrorContent>

const DEFAULT_ERROR_CONTENT = {
  title: "error.default.title",
  description: "error.default.description",
} as const satisfies ErrorContent

function getErrorStatus(error: unknown) {
  if (isRouteErrorResponse(error)) return error.status
  return 500
}

export default function ErrorElement() {
  const error = useRouteError()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const status = getErrorStatus(error)
  const content =
    ERROR_STATUS_KEYS[status as keyof typeof ERROR_STATUS_KEYS] ??
    DEFAULT_ERROR_CONTENT

  return (
    <div className="flex-center min-h-[60vh] px-4 py-12">
      <div className="w-full max-w-md space-y-6 text-center">
        <p className="text-5xl font-semibold text-primary">{status}</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">
            {t(content.title)}
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            {t(content.description)}
          </p>
        </div>

        <Button onClick={() => navigate(-1)}>{t("error.back")}</Button>
      </div>
    </div>
  )
}
