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
import { deleteLink } from "@/services/api/link"
import { HttpError } from "@/services/http/client"
import type { GetLinkListResponse } from "@/types/link"

type LinkItem = GetLinkListResponse[number]

interface DeleteLinkDialogProps {
  open: boolean
  item?: LinkItem | null
  onOpenChange: (open: boolean) => void
}

function getDeleteErrorKey(error: Error) {
  if (error instanceof HttpError && error.errorCode === "LINK_NOT_FOUND") {
    return "auth.community.deleteDialog.notFound"
  }

  return "auth.community.deleteDialog.failed"
}

export default function DeleteLinkDialog({
  open,
  item = null,
  onOpenChange,
}: DeleteLinkDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  // 网络请求
  const deleteMutation = useMutation({
    mutationFn: async (deletedItem: LinkItem) => {
      await deleteLink({ id: deletedItem.id })
      return deletedItem
    },
    onSuccess: async (deletedItem) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["links"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ])

      toast.success(
        t("auth.community.deleteDialog.success", { name: deletedItem.name })
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

    if (!item || deleteMutation.isPending) return

    deleteMutation.mutate(item)
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
            {t("auth.community.deleteDialog.title")}
          </AlertDialogTitle>

          <AlertDialogDescription>
            {item
              ? t("auth.community.deleteDialog.description", {
                  name: item.name,
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
            disabled={deleteMutation.isPending || !item}
            onClick={handleConfirm}
          >
            {deleteMutation.isPending
              ? t("auth.community.deleteDialog.deleting")
              : t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
