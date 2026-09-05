import { Suspense } from "react"
import { useTranslation } from "react-i18next"
import { Outlet, useLocation, useMatches } from "react-router-dom"

import AppLoading from "@/components/layout/fallback/AppLoading"
import Footer from "@/components/layout/Footer"
import Navbar from "@/components/layout/Navbar"
import PublicScrollRestoration from "@/components/layout/PublicScrollRestoration"
import type { I18nKey } from "@/i18n/types"

type RouteHandle = {
  title?: I18nKey
  hideFooter?: boolean
  backTo?: string
}

const DEFAULT_NAVBAR_PATHS = new Set(["/", "/archive", "/links", "/about"])

export default function RootLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const matches = useMatches()

  const normalizedPathname = location.pathname.replace(/\/+$/, "") || "/"
  const variant = DEFAULT_NAVBAR_PATHS.has(normalizedPathname)
    ? "default"
    : "subpage"

  const currentMatch = matches.at(-1)
  const handle = (currentMatch?.handle ?? {}) as RouteHandle

  const pageTitle = handle.title ? t(handle.title) : ""
  const hideFooter = handle.hideFooter ?? false
  const backTo = handle.backTo

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl min-w-0 flex-col sm:px-6 lg:px-8">
        <header className="fixed inset-x-0 top-0 z-40 p-4 sm:px-10 lg:px-12">
          <Navbar variant={variant} pageTitle={pageTitle} backTo={backTo} />
        </header>
        <div aria-hidden="true" className="h-21.5 shrink-0" />
        <main className="min-w-0 flex-1 px-4 pb-4">
          <PublicScrollRestoration>
            <Suspense fallback={<AppLoading variant="public" />}>
              <Outlet />
            </Suspense>
          </PublicScrollRestoration>
        </main>
        {!hideFooter && (
          <footer className="border-t border-border">
            <Footer />
          </footer>
        )}
      </div>
    </div>
  )
}
