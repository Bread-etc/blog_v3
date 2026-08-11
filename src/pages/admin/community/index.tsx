import { useState } from "react"
import { useTranslation } from "react-i18next"

import {
  Delete02Icon,
  Link04Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQuery } from "@tanstack/react-query"

import AdminTable from "@/components/admin/AdminTable"
import type { AdminTableColumn } from "@/components/admin/AdminTable"
import { Button } from "@/components/ui/button"
import DeleteLinkDialog from "@/pages/admin/community/components/DeleteLinkDialog"
import LinkEditorDialog from "@/pages/admin/community/components/LinkEditorDialog"
import { getLinks } from "@/services/api/link"
import type { GetLinkListResponse } from "@/types/link"

type LinkRow = GetLinkListResponse[number]

export default function Community() {
  const { t } = useTranslation()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<LinkRow | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingLink, setDeletingLink] = useState<LinkRow | null>(null)

  // 网络请求
  const linksQuery = useQuery({
    queryKey: ["links"],
    queryFn: getLinks,
  })

  // Variables
  const links = linksQuery.data ?? []

  // Functions
  function handleCreate() {
    setEditingLink(null)
    setEditorOpen(true)
  }

  function handleEdit(row: LinkRow) {
    setEditingLink(row)
    setEditorOpen(true)
  }

  function handleDelete(row: LinkRow) {
    setDeletingLink(row)
    setDeleteDialogOpen(true)
  }

  const columns: AdminTableColumn<LinkRow>[] = [
    {
      key: "sort",
      title: t("auth.community.columns.sort"),
      width: "10%",
      render: (row) => (
        <span className="text-muted-foreground tabular-nums">{row.sort}</span>
      ),
    },
    {
      key: "name",
      title: t("auth.community.columns.name"),
      width: "20%",
      render: (row) => (
        <button
          type="button"
          className="block max-w-64 truncate font-medium text-foreground transition-colors hover:text-primary hover:underline"
          onClick={() => handleEdit(row)}
        >
          {row.name}
        </button>
      ),
    },
    {
      key: "url",
      title: t("auth.community.columns.url"),
      width: "30%",
      render: (row) => (
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex max-w-72 items-center gap-1.5 text-primary hover:underline"
        >
          <HugeiconsIcon
            icon={Link04Icon}
            className="size-4 shrink-0"
            aria-hidden="true"
          />
          <span className="truncate">{row.url}</span>
        </a>
      ),
    },
    {
      key: "description",
      title: t("auth.community.columns.description"),
      width: "30%",
      render: (row) => (
        <span className="block max-w-md truncate text-muted-foreground">
          {row.description || "--"}
        </span>
      ),
    },
    {
      key: "actions",
      title: t("auth.community.columns.actions"),
      align: "right",
      render: (row) => (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label={t("auth.community.actions.deleteLabel", {
            name: row.name,
          })}
          onClick={() => handleDelete(row)}
        >
          <HugeiconsIcon icon={Delete02Icon} className="size-4.5" />
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          {t("auth.community.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("auth.community.description")}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          {linksQuery.data
            ? t("auth.community.count", { count: links.length })
            : null}
        </div>

        <Button className="rounded-sm" onClick={handleCreate}>
          <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
          {t("auth.community.actions.add")}
        </Button>
      </div>

      <AdminTable
        rows={links}
        columns={columns}
        rowKey="id"
        loading={linksQuery.isPending}
        error={linksQuery.isError && !linksQuery.data}
        emptyText={t("auth.community.empty")}
        errorText={t("auth.community.loadFailed")}
        onRetry={() => void linksQuery.refetch()}
      />

      <LinkEditorDialog
        open={editorOpen}
        item={editingLink}
        onOpenChange={setEditorOpen}
      />

      <DeleteLinkDialog
        open={deleteDialogOpen}
        item={deletingLink}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  )
}
