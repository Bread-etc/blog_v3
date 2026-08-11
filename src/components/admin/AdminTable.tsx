import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface AdminTableColumn<T> {
  key: string
  title: ReactNode
  width?: string
  align?: "left" | "center" | "right"
  render?: (row: T, index: number) => ReactNode
}

interface AdminTableProps<T> {
  rows: T[]
  columns: AdminTableColumn<T>[]
  rowKey: keyof T | ((row: T) => string | number)
  loading?: boolean
  error?: boolean
  emptyText?: ReactNode
  errorText?: ReactNode
  onRetry?: () => void
}

function getRowKey<T>(row: T, rowKey: AdminTableProps<T>["rowKey"]) {
  if (typeof rowKey === "function") {
    return String(rowKey(row))
  }
  return String(row[rowKey])
}

function getCellValue<T>(row: T, key: string) {
  return row[key as keyof T]
}

function getAlignClassName(align?: AdminTableColumn<unknown>["align"]) {
  if (align === "center") return "text-center"
  if (align === "right") return "text-right"
  return undefined
}

function AdminTableState({
  title,
  description,
  action,
}: {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex min-h-20 flex-col items-center justify-center px-6 py-10 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  )
}

export default function AdminTable<T>({
  rows,
  columns,
  rowKey,
  loading = false,
  error = false,
  emptyText,
  errorText,
  onRetry,
}: AdminTableProps<T>) {
  const { t } = useTranslation()

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                style={{ width: column.width }}
                className={getAlignClassName(column.align)}
              >
                {column.title}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="p-0">
                <AdminTableState
                  title={t("common.table.loadingTitle")}
                  description={t("common.table.loadingDescription")}
                />
              </TableCell>
            </TableRow>
          ) : null}

          {!loading && error ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="p-0">
                <AdminTableState
                  title={errorText ?? t("common.table.errorTitle")}
                  description={t("common.table.errorDescription")}
                  action={
                    onRetry ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-md"
                        onClick={onRetry}
                      >
                        {t("common.retry")}
                      </Button>
                    ) : null
                  }
                />
              </TableCell>
            </TableRow>
          ) : null}

          {!loading && !error && rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="p-0">
                <AdminTableState
                  title={emptyText ?? t("common.table.emptyTitle")}
                  description={t("common.table.emptyDescription")}
                />
              </TableCell>
            </TableRow>
          ) : null}

          {!loading && !error
            ? rows.map((row, index) => (
                <TableRow key={getRowKey(row, rowKey)}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={getAlignClassName(column.align)}
                    >
                      {column.render
                        ? column.render(row, index)
                        : String(getCellValue(row, column.key) ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
    </div>
  )
}
