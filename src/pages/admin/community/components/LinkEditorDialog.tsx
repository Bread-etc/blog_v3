import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createLink, updateLink } from "@/services/api/link"
import { HttpError } from "@/services/http/client"
import type { CreateLinkRequest, GetLinkListResponse } from "@/types/link"

type LinkItem = GetLinkListResponse[number]

interface LinkFormValues {
  name: string
  url: string
  description: string
  sort: string
}

interface LinkEditorDialogProps {
  open: boolean
  item?: LinkItem | null
  onOpenChange: (open: boolean) => void
}

const EMPTY_FORM: LinkFormValues = {
  name: "",
  url: "",
  description: "",
  sort: "0",
}

function getLinkErrorKey(error: Error) {
  if (error instanceof HttpError) {
    switch (error.errorCode) {
      case "LINK_URL_INVALID":
        return "auth.community.editor.urlInvalid"
      case "LINK_SORT_INVALID":
        return "auth.community.editor.sortInvalid"
      case "LINK_NOT_FOUND":
        return "auth.community.editor.notFound"
    }
  }

  return "auth.community.editor.saveFailed"
}

export default function LinkEditorDialog({
  open,
  item = null,
  onOpenChange,
}: LinkEditorDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [formValues, setFormValues] = useState<LinkFormValues>(EMPTY_FORM)

  const isEditing = item !== null
  const sort = Number(formValues.sort)
  const canSubmit = Boolean(
    formValues.name.trim() &&
    formValues.url.trim() &&
    formValues.sort.trim() &&
    Number.isInteger(sort) &&
    sort >= 0
  )

  const saveMutation = useMutation({
    mutationFn: async (values: CreateLinkRequest) => {
      if (item) {
        await updateLink({ id: item.id, ...values })
      } else {
        await createLink(values)
      }

      return values
    },
    onSuccess: async (savedValues) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["links"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ])

      toast.success(
        isEditing
          ? t("auth.community.editor.updated", { name: savedValues.name })
          : t("auth.community.editor.created", { name: savedValues.name })
      )

      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(t(getLinkErrorKey(error)))
    },
  })
  const resetSaveMutation = saveMutation.reset

  useEffect(() => {
    if (!open) return

    resetSaveMutation()
    setFormValues(
      item
        ? {
            name: item.name,
            url: item.url,
            description: item.description,
            sort: String(item.sort),
          }
        : EMPTY_FORM
    )
  }, [item, open, resetSaveMutation])

  function handleOpenChange(nextOpen: boolean) {
    if (saveMutation.isPending) return

    onOpenChange(nextOpen)
  }

  function handleFieldChange(
    field: Exclude<keyof LinkFormValues, "sort">,
    value: string
  ) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleSubmit() {
    if (!canSubmit || saveMutation.isPending) return

    saveMutation.mutate({
      name: formValues.name.trim(),
      url: formValues.url.trim(),
      description: formValues.description.trim(),
      sort,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {isEditing
              ? t("auth.community.editor.editTitle")
              : t("auth.community.editor.createTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t("auth.community.editor.description")}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            handleSubmit()
          }}
        >
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="link-name">
                {t("auth.community.editor.name")}
              </FieldLabel>
              <Input
                id="link-name"
                value={formValues.name}
                placeholder={t("auth.community.editor.namePlaceholder")}
                autoComplete="off"
                disabled={saveMutation.isPending}
                required
                maxLength={50}
                className="rounded-md focus-visible:ring-2"
                onChange={(event) =>
                  handleFieldChange("name", event.target.value)
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="link-url">
                {t("auth.community.editor.url")}
              </FieldLabel>
              <Input
                id="link-url"
                type="url"
                value={formValues.url}
                placeholder={t("auth.community.editor.urlPlaceholder")}
                autoComplete="url"
                disabled={saveMutation.isPending}
                required
                maxLength={255}
                className="rounded-md focus-visible:ring-2"
                onChange={(event) =>
                  handleFieldChange("url", event.target.value)
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="link-description">
                {t("auth.community.editor.descriptionLabel")}
              </FieldLabel>
              <Textarea
                id="link-description"
                value={formValues.description}
                placeholder={t("auth.community.editor.descriptionPlaceholder")}
                disabled={saveMutation.isPending}
                maxLength={255}
                rows={3}
                className="field-sizing-fixed resize-y rounded-md focus-visible:ring-2"
                onChange={(event) =>
                  handleFieldChange("description", event.target.value)
                }
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="link-sort">
                {t("auth.community.editor.sort")}
              </FieldLabel>
              <Input
                id="link-sort"
                type="number"
                value={formValues.sort}
                placeholder="0"
                inputMode="numeric"
                disabled={saveMutation.isPending}
                required
                min={0}
                step={1}
                className="rounded-md focus-visible:ring-2"
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    sort: event.target.value,
                  }))
                }
              />
              <FieldDescription>
                {t("auth.community.editor.sortDescription")}
              </FieldDescription>
            </Field>
          </FieldGroup>

          <DialogFooter className="m-0 border-0 bg-transparent p-0 pt-1">
            <Button
              type="button"
              variant="outline"
              disabled={saveMutation.isPending}
              className="rounded-md px-3"
              onClick={() => handleOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending || !canSubmit}
              className="rounded-md px-3"
            >
              {saveMutation.isPending
                ? t("auth.community.editor.saving")
                : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
