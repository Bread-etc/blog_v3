import { Suspense } from "react"
import { useTranslation } from "react-i18next"
import { Navigate, Outlet, useMatches } from "react-router-dom"

import AdminHeader from "@/components/layout/admin/AdminHeader"
import AdminSidebar from "@/components/layout/admin/AdminSidebar"
import AppLoading from "@/components/layout/fallback/AppLoading"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import type { I18nKey } from "@/i18n/types"
import { useUserStore } from "@/store/userStore"

type AdminRouteHandle = {
  title?: I18nKey
}

export default function AdminLayout() {
  const { t } = useTranslation()
  const token = useUserStore((state) => state.token)
  const matches = useMatches()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  const currentMatch = matches.at(-1)
  const handle = (currentMatch?.handle ?? {}) as AdminRouteHandle
  const pageTitle = handle.title ? t(handle.title) : ""

  return (
    <SidebarProvider>
      <AdminSidebar />

      <SidebarInset>
        <div className="min-h-screen bg-background text-foreground">
          <AdminHeader title={pageTitle} />

          <main className="min-w-0 p-4">
            <Suspense fallback={<AppLoading variant="admin" />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
