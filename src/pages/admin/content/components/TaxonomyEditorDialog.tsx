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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createCategory, updateCategory } from "@/services/api/category"
import { createTag, updateTag } from "@/services/api/tag"
import { HttpError } from "@/services/http/client"
import type { GetCategoriesResponse } from "@/types/category"
import type { GetTagsResponse } from "@/types/tag"

type TaxonomyType = "category" | "tag"
type TaxonomyItem = GetCategoriesResponse[number] | GetTagsResponse[number]

interface TaxonomyFormValues {
  name: string
  slug: string
}

interface TaxonomyEditorDialogProps {
  open: boolean
  type: TaxonomyType
  item?: TaxonomyItem | null
  onOpenChange: (open: boolean) => void
}

const EMPTY_FORM: TaxonomyFormValues = {
  name: "",
  slug: "",
}

const QUERY_KEYS = {
  category: ["categories"],
  tag: ["tags"],
} as const

function getTaxonomyErrorKey(error: Error) {
  if (error instanceof HttpError) {
    switch (error.errorCode) {
      case "CATEGORY_NAME_EXISTS":
      case "TAG_NAME_EXISTS":
        return "auth.content.taxonomy.nameExists"
      case "CATEGORY_SLUG_EXISTS":
      case "TAG_SLUG_EXISTS":
        return "auth.content.taxonomy.slugExists"
      case "CATEGORY_NOT_FOUND":
      case "TAG_NOT_FOUND":
        return "auth.content.taxonomy.notFound"
    }
  }

  return "auth.content.taxonomy.saveFailed"
}

export default function TaxonomyEditorDialog({
  open,
  type,
  item = null,
  onOpenChange,
}: TaxonomyEditorDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  // Variables
  const [formValues, setFormValues] = useState<TaxonomyFormValues>(EMPTY_FORM)
  const isEditing = item !== null
  const titleKey =
    type === "category"
      ? isEditing
        ? "auth.content.taxonomy.editCategoryTitle"
        : "auth.content.taxonomy.createCategoryTitle"
      : isEditing
        ? "auth.content.taxonomy.editTagTitle"
        : "auth.content.taxonomy.createTagTitle"

  // 网络请求
  const saveMutation = useMutation({
    mutationFn: async (values: TaxonomyFormValues) => {
      if (type === "category") {
        if (item) {
          await updateCategory({ id: item.id, ...values })
        } else {
          await createCategory(values)
        }
      } else if (item) {
        await updateTag({ id: item.id, ...values })
      } else {
        await createTag(values)
      }

      return values
    },
    onSuccess: async (savedValues) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS[type],
        }),
        queryClient.invalidateQueries({
          queryKey: ["posts"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["post"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ])

      const entity =
        type === "category"
          ? t("auth.content.entities.category")
          : t("auth.content.entities.tag")

      toast.success(
        isEditing
          ? t("auth.content.taxonomy.updated", {
              entity,
              name: savedValues.name,
            })
          : t("auth.content.taxonomy.created", {
              entity,
              name: savedValues.name,
            })
      )

      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(t(getTaxonomyErrorKey(error)))
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
            slug: item.slug,
          }
        : EMPTY_FORM
    )
  }, [item, open, resetSaveMutation])

  // Functions
  function handleOpenChange(nextOpen: boolean) {
    if (saveMutation.isPending) return

    onOpenChange(nextOpen)
  }

  function handleSubmit() {
    const name = formValues.name.trim()
    const slug = formValues.slug.trim()

    if (!name || !slug) return

    saveMutation.mutate({
      name,
      slug,
    })
  }

  function handleFieldChange(field: keyof TaxonomyFormValues, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-md sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {t(titleKey)}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t("auth.content.taxonomy.description")}
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
              <FieldLabel htmlFor="taxonomy-name">
                {t("auth.content.taxonomy.name")}
              </FieldLabel>
              <Input
                id="taxonomy-name"
                value={formValues.name}
                placeholder={t("auth.content.taxonomy.namePlaceholder")}
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
              <FieldLabel htmlFor="taxonomy-slug">
                {t("auth.content.taxonomy.slug")}
              </FieldLabel>
              <Input
                id="taxonomy-slug"
                value={formValues.slug}
                placeholder={t("auth.content.taxonomy.slugPlaceholder")}
                autoComplete="off"
                disabled={saveMutation.isPending}
                required
                maxLength={100}
                className="rounded-md focus-visible:ring-2"
                onChange={(event) =>
                  handleFieldChange("slug", event.target.value)
                }
              />
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
              disabled={
                saveMutation.isPending ||
                !formValues.name.trim() ||
                !formValues.slug.trim()
              }
              className="rounded-md px-3"
            >
              {saveMutation.isPending
                ? t("auth.content.taxonomy.saving")
                : t("common.confirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
