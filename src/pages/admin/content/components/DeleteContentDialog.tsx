import type { MouseEvent } from "react"
import { useTranslation } from "react-i18next"

import { Delete02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteCategory } from "@/services/api/category"
import { deletePost } from "@/services/api/post"
import { deleteTag } from "@/services/api/tag"
import { HttpError } from "@/services/http/client"

export type DeleteContentType = "post" | "category" | "tag"

export interface DeleteContentTarget {
  id: string
  type: DeleteContentType
  label: string
  slug?: string
}

interface DeleteContentDialogProps {
  open: boolean
  target: DeleteContentTarget | null
  onOpenChange: (open: boolean) => void
}

const QUERY_KEYS = {
  post: ["posts"],
  category: ["categories"],
  tag: ["tags"],
} as const

export default function DeleteContentDialog({
  open,
  target,
  onOpenChange,
}: DeleteContentDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  // 网络请求
  const deleteMutation = useMutation({
    mutationFn: async (deletedTarget: DeleteContentTarget) => {
      const { id, type } = deletedTarget

      if (type === "post") {
        await deletePost({ id })
      } else if (type === "category") {
        await deleteCategory({ id })
      } else {
        await deleteTag({ id })
      }

      return deletedTarget
    },
    onSuccess: async (deletedTarget) => {
      if (deletedTarget.type === "post" && deletedTarget.slug) {
        queryClient.removeQueries({
          queryKey: ["post", "detail", deletedTarget.slug],
          exact: true,
        })
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS[deletedTarget.type],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ])

      const entity =
        deletedTarget.type === "post"
          ? t("auth.content.entities.post")
          : deletedTarget.type === "category"
            ? t("auth.content.entities.category")
            : t("auth.content.entities.tag")

      toast.success(
        t("auth.content.deleteDialog.success", {
          entity,
          name: deletedTarget.label,
        })
      )

      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(t(getDeleteErrorKey(error)))
    },
  })

  // Functions
  function handleOpenChange(nextOpen: boolean) {
    if (deleteMutation.isPending) return

    onOpenChange(nextOpen)
  }

  function handleConfirm(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()

    if (!target) return

    deleteMutation.mutate(target)
  }

  function getDeleteErrorKey(error: Error) {
    if (error instanceof HttpError) {
      if (error.errorCode === "CATEGORY_IN_USE") {
        return "auth.content.deleteDialog.categoryInUse"
      }

      if (error.errorCode === "TAG_IN_USE") {
        return "auth.content.deleteDialog.tagInUse"
      }
    }

    return "auth.content.deleteDialog.failed"
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent
        size="sm"
        className="rounded-md shadow-xl shadow-black/10"
      >
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <HugeiconsIcon icon={Delete02Icon} />
          </AlertDialogMedia>

          <AlertDialogTitle>
            {t("auth.content.deleteDialog.title")}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {target
              ? t("auth.content.deleteDialog.description", {
                  name: target.label,
                })
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            className="rounded-md"
            disabled={deleteMutation.isPending}
          >
            {t("common.cancel")}
          </AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
            className="rounded-md"
            disabled={deleteMutation.isPending || !target}
            onClick={handleConfirm}
          >
            {deleteMutation.isPending
              ? t("auth.content.deleteDialog.deleting")
              : t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
