import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import {
  DatabaseIcon,
  File02Icon,
  Link04Icon,
  PlusSignIcon,
  TagsIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQuery } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { getDashboardStats, getTopPosts } from "@/services/api/dashboard"
import { getHealth } from "@/services/api/health"

import StatCard from "./components/StatCard"

type StatTone = "positive" | "negative" | "neutral"

function getGrowthTone(value: number): StatTone {
  if (value > 0) return "positive"
  if (value < 0) return "negative"
  return "neutral"
}

function formatGrowthValue(value: number) {
  return `${value > 0 ? "+" : ""}${value}%`
}

export default function Overview() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // 网络请求
  const statsQuery = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: getDashboardStats,
  })
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
  })
  const topPostsQuery = useQuery({
    queryKey: ["dashboard", "topPosts", { limit: 5 }],
    queryFn: () => getTopPosts({ limit: 5 }),
  })
  if (statsQuery.isPending) {
    return (
      <div className="text-sm text-muted-foreground">
        {t("common.table.loadingTitle")}
      </div>
    )
  }

  if (statsQuery.isError) {
    return (
      <div className="text-sm text-destructive">
        {t("common.admin.failToLoad")}
      </div>
    )
  }

  // Variables
  const stats = statsQuery.data
  const topPosts = topPostsQuery.data ?? []
  const isTopPostsPending = topPostsQuery.isPending
  const isTopPostsError = topPostsQuery.isError
  const isDatabaseUp =
    healthQuery.isSuccess &&
    healthQuery.data.status === "UP" &&
    healthQuery.data.database === "connected"

  return (
    <div className="space-y-4">
      {/* 顶部信息卡片 */}
      <div className="auto-rows-[minmax(180px, auto)] grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("auth.overview.totalPosts")}
          value={stats.posts.total}
          icon={File02Icon}
          tone={getGrowthTone(stats.posts.moMGrowth)}
          hint={t("auth.overview.monthGrowth", {
            value: formatGrowthValue(stats.posts.moMGrowth),
          })}
        />
        <StatCard
          title={t("auth.overview.totalTags")}
          value={stats.tags.total}
          icon={TagsIcon}
          tone={getGrowthTone(stats.tags.moMGrowth)}
          hint={t("auth.overview.monthGrowth", {
            value: formatGrowthValue(stats.tags.moMGrowth),
          })}
        />
        <StatCard
          title={t("auth.overview.friendLinks")}
          value={stats.links.total}
          icon={Link04Icon}
          tone={getGrowthTone(stats.links.moMGrowth)}
          hint={t("auth.overview.monthGrowth", {
            value: formatGrowthValue(stats.links.moMGrowth),
          })}
        />
        <StatCard
          mode="database"
          title={t("auth.overview.systemStatus")}
          value={
            isDatabaseUp
              ? t("auth.overview.connected")
              : t("auth.overview.disconnected")
          }
          icon={DatabaseIcon}
          status={isDatabaseUp ? "up" : "down"}
        />
      </div>
      {/* 流量列表 + 创建卡片 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="col-span-2 overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary md:col-span-3">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-foreground">
              {t("auth.overview.topViewsTitle")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("auth.overview.topViewsTip")}
            </p>
          </div>
          <div className="flex-1 overflow-auto">
            <Table>
              <TableBody>
                {isTopPostsPending ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-20 text-center">
                      <div className="flex flex-col items-center justify-center text-center">
                        <p className="animate-pulse text-sm font-medium text-foreground">
                          {t("common.table.loadingTitle")}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t("common.table.loadingDescription")}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}

                {!isTopPostsPending &&
                (isTopPostsError || topPosts.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={2} className="h-20 text-center">
                      <div className="flex flex-col items-center justify-center text-center">
                        <p className="text-sm font-medium text-foreground">
                          {t("common.table.emptyTitle")}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t("common.table.emptyDescription")}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}

                {!isTopPostsPending && !isTopPostsError
                  ? topPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="border-t border-border px-4 py-3">
                          <p className="max-w-md truncate text-sm font-medium text-foreground">
                            {post.title}
                          </p>
                        </TableCell>
                        <TableCell className="w-32 border-t border-border px-4 py-3 text-center">
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={ViewIcon} className="size-4" />
                            <span className="text-sm text-muted-foreground tabular-nums">
                              {post.views.toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="col-span-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary md:col-span-1 md:min-h-70">
          <div className="group flex h-full flex-col items-center justify-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-sm bg-primary/10 transition-transform duration-300 group-hover:scale-110">
              <HugeiconsIcon
                icon={PlusSignIcon}
                className="size-8 text-primary"
              />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-foreground">
                {t("auth.overview.createCardTitle")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("auth.overview.createCardTip")}
              </p>
            </div>
            <Button
              className="mt-4 w-4/5 cursor-pointer rounded-sm py-4 transition-opacity hover:opacity-80"
              onClick={() => navigate("/admin/content")}
            >
              {t("auth.overview.startWriting")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
