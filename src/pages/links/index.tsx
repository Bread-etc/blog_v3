import { useTranslation } from "react-i18next"

import {
  ArrowReloadHorizontalIcon,
  ArrowUpRight01Icon,
  Link04Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQuery } from "@tanstack/react-query"

import { ScrollRestorationReady } from "@/components/layout/PublicScrollRestoration"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useSiteConfig } from "@/hooks/useSiteConfig"
import { getLinks } from "@/services/api/link"

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)

  if (words.length > 1) {
    return `${words[0][0]}${words.at(-1)?.[0] ?? ""}`.toUpperCase()
  }

  return Array.from(words[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export default function Links() {
  const { t } = useTranslation()

  // 网络请求
  const linksQuery = useQuery({
    queryKey: ["links"],
    queryFn: getLinks,
  })
  const configQuery = useSiteConfig()

  // Variables
  const links = linksQuery.data ?? []
  const contactEmail = configQuery.data?.email.trim()

  return (
    <div className="mx-auto w-full">
      <ScrollRestorationReady ready={!linksQuery.isPending} />
      <header className="max-w-2xl">
        <h1 className="text-2xl font-semibold">{t("links.title")}</h1>
        <p className="text-base leading-7 text-muted-foreground">
          {t("links.description")}
        </p>
      </header>

      <section className="mt-10" aria-labelledby="links-heading">
        <h2 id="links-heading" className="sr-only">
          {t("links.title")}
        </h2>

        {linksQuery.isPending ? (
          <div
            role="status"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <span className="sr-only">{t("links.loading")}</span>

            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="min-h-52 rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between">
                  <Skeleton className="size-11" />
                  <Skeleton className="size-5" />
                </div>

                <div className="mt-5 space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="mt-5 h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : linksQuery.isError && !linksQuery.data ? (
          <div
            role="alert"
            className="flex min-h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-4 text-center"
          >
            <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <HugeiconsIcon icon={Link04Icon} className="size-5" />
            </div>

            <h2 className="mt-4 font-medium">{t("links.error.title")}</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {t("links.error.description")}
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => void linksQuery.refetch()}
            >
              <HugeiconsIcon
                icon={ArrowReloadHorizontalIcon}
                className="size-4"
              />
              {t("common.retry")}
            </Button>
          </div>
        ) : links.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-4 text-center">
            <div className="flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <HugeiconsIcon icon={Link04Icon} className="size-5" />
            </div>

            <h2 className="mt-4 font-medium">{t("links.empty.title")}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("links.empty.description")}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-52 flex-col rounded-lg border border-border bg-card p-4 transition-colors outline-none hover:border-primary/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-sm font-semibold">
                    {getInitials(link.name)}
                  </div>

                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    className="size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
                    aria-hidden="true"
                  />
                </div>

                <div className="mt-4 min-w-0">
                  <h2 className="text-lg font-semibold wrap-break-word transition-colors group-hover:text-primary">
                    {link.name}
                  </h2>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {getHostname(link.url)}
                  </p>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {link.description || t("links.card.noDescription")}
                </p>
              </a>
            ))}
          </div>
        )}
      </section>

      {contactEmail ? (
        <section className="mt-12 rounded-lg border-2 border-dashed border-border bg-card/50 p-6 text-center sm:p-8">
          <div className="mx-auto max-w-md space-y-3">
            <h2 className="font-semibold">{t("links.contact.title")}</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {t("links.contact.description")}
            </p>

            <Button asChild size="lg">
              <a href={`mailto:${contactEmail}`}>{t("links.contact.action")}</a>
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  )
}
