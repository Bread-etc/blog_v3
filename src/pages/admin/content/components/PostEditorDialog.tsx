import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { getCategories } from "@/services/api/category"
import { createPost, getPostDetail, updatePost } from "@/services/api/post"
import { getTags } from "@/services/api/tag"
import { HttpError } from "@/services/http/client"
import type { CreatePostRequest, GetPostListResponse } from "@/types/post"

type PostRow = GetPostListResponse["list"][number]
type PostTextField = "title" | "content" | "summary" | "slug" | "cover"

interface PostEditorDialogProps {
  open: boolean
  item?: PostRow | null
  onOpenChange: (open: boolean) => void
}

const EMPTY_FORM: CreatePostRequest = {
  title: "",
  content: "",
  summary: "",
  slug: "",
  cover: "",
  categoryId: "",
  tagIds: [],
  isPublished: false,
}

function getPostErrorKey(error: Error) {
  if (error instanceof HttpError) {
    switch (error.errorCode) {
      case "POST_SLUG_EXISTS":
        return "auth.content.postEditor.slugExists"
      case "POST_CATEGORY_NOT_FOUND":
      case "POST_CATEGORY_ID_INVALID":
        return "auth.content.postEditor.categoryInvalid"
      case "POST_TAG_NOT_FOUND":
      case "POST_TAG_IDS_INVALID":
        return "auth.content.postEditor.tagsInvalid"
      case "POST_COVER_URL_INVALID":
        return "auth.content.postEditor.coverInvalid"
      case "POST_NOT_FOUND":
        return "auth.content.postEditor.notFound"
    }
  }

  return "auth.content.postEditor.saveFailed"
}

interface LoadingContentProps {
  text: string
}

function LoadingContent({ text }: LoadingContentProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
      <HugeiconsIcon icon={Loading03Icon} className="size-6 animate-spin" />
      <p className="text-sm">{text}</p>
    </div>
  )
}

interface LoadErrorContentProps {
  text: string
  retryLabel: string
  onRetry: () => void
}

function LoadErrorContent({
  text,
  retryLabel,
  onRetry,
}: LoadErrorContentProps) {
  return (
    <div
      role="alert"
      className="flex flex-1 flex-col items-center justify-center gap-3 text-center"
    >
      <p className="text-sm text-destructive">{text}</p>
      <Button variant="outline" onClick={onRetry} className="rounded-md px-3">
        {retryLabel}
      </Button>
    </div>
  )
}

export default function PostEditorDialog({
  open,
  item = null,
  onOpenChange,
}: PostEditorDialogProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const initializedItemId = useRef<string | null>(null)

  const [formValues, setFormValues] = useState<CreatePostRequest>(EMPTY_FORM)

  // Variables
  const isEditing = item !== null
  const itemId = item?.id ?? null
  const itemSlug = item?.slug ?? ""

  // 网络请求
  const detailQuery = useQuery({
    queryKey: ["post", "detail", itemSlug],
    queryFn: () => getPostDetail({ slug: itemSlug }),
    enabled: open && isEditing,
  })
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: open,
  })
  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
    enabled: open,
  })

  const saveMutation = useMutation({
    mutationFn: (values: CreatePostRequest) => {
      if (item) {
        return updatePost({
          id: item.id,
          ...values,
        })
      }

      return createPost(values)
    },
    onSuccess: async (savedPost) => {
      queryClient.setQueryData(["post", "detail", savedPost.slug], savedPost)

      if (itemSlug && itemSlug !== savedPost.slug) {
        queryClient.removeQueries({
          queryKey: ["post", "detail", itemSlug],
          // 只删除完全匹配的缓存
          exact: true,
        })
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["posts"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["dashboard"],
        }),
      ])

      toast.success(
        isEditing
          ? t("auth.content.postEditor.updated", {
              name: savedPost.title,
            })
          : t("auth.content.postEditor.created", {
              name: savedPost.title,
            })
      )

      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(t(getPostErrorKey(error)))
    },
  })
  const resetSaveMutation = saveMutation.reset

  useEffect(() => {
    if (!open) return

    initializedItemId.current = null
    resetSaveMutation()
    setFormValues(EMPTY_FORM)
  }, [itemId, open, resetSaveMutation])

  useEffect(() => {
    const detail = detailQuery.data

    if (
      !open ||
      !itemId ||
      !detail ||
      detail.id !== itemId ||
      initializedItemId.current === itemId
    ) {
      return
    }

    setFormValues({
      title: detail.title,
      content: detail.content,
      summary: detail.summary,
      slug: detail.slug,
      cover: detail.cover,
      categoryId: detail.category.id,
      tagIds: detail.tags.map((tag) => tag.id),
      isPublished: detail.isPublished,
    })

    initializedItemId.current = itemId
  }, [detailQuery.data, itemId, open])

  const categories = categoriesQuery.data ?? []
  const tags = tagsQuery.data ?? []

  const isLoading =
    (isEditing && detailQuery.isPending) ||
    categoriesQuery.isPending ||
    tagsQuery.isPending

  const hasLoadError =
    (isEditing && detailQuery.isError && !detailQuery.data) ||
    (categoriesQuery.isError && !categoriesQuery.data) ||
    (tagsQuery.isError && !tagsQuery.data)

  const canSubmit = Boolean(
    formValues.title.trim() &&
    formValues.content.trim() &&
    formValues.slug.trim() &&
    formValues.categoryId &&
    formValues.tagIds.length > 0
  )

  // Functions
  function handleOpenChange(nextOpen: boolean) {
    if (saveMutation.isPending) return

    onOpenChange(nextOpen)
  }

  function handleTextFieldChange(field: PostTextField, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleTagChange(tagId: string, checked: boolean) {
    setFormValues((current) => ({
      ...current,
      tagIds: checked
        ? [...current.tagIds, tagId]
        : current.tagIds.filter((id) => id !== tagId),
    }))
  }

  function handleRetry() {
    if (isEditing && detailQuery.isError) {
      void detailQuery.refetch()
    }

    if (categoriesQuery.isError) {
      void categoriesQuery.refetch()
    }

    if (tagsQuery.isError) {
      void tagsQuery.refetch()
    }
  }

  function handleSubmit() {
    if (!canSubmit) return

    saveMutation.mutate({
      ...formValues,
      title: formValues.title.trim(),
      summary: formValues.summary.trim(),
      slug: formValues.slug.trim(),
      cover: formValues.cover.trim(),
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex h-[calc(100dvh-2rem)] max-h-200 w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-md p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 border-b p-4">
          <DialogTitle className="text-base font-semibold">
            {isEditing
              ? t("auth.content.postEditor.editTitle")
              : t("auth.content.postEditor.createTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {t("auth.content.postEditor.description")}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <LoadingContent text={t("auth.content.postEditor.loading")} />
        ) : hasLoadError ? (
          <LoadErrorContent
            text={t("auth.content.postEditor.loadFailed")}
            retryLabel={t("auth.content.postEditor.retry")}
            onRetry={handleRetry}
          />
        ) : (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => {
              event.preventDefault()
              handleSubmit()
            }}
          >
            <div className="scrollbar-none grid min-h-0 flex-1 grid-cols-1 content-start overflow-y-auto lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] lg:grid-rows-1 lg:content-stretch lg:overflow-hidden">
              <FieldGroup className="gap-2 p-4 lg:min-h-0 lg:border-r">
                <Field>
                  <FieldLabel htmlFor="post-title">
                    {t("auth.content.postEditor.title")}
                  </FieldLabel>
                  <Input
                    id="post-title"
                    value={formValues.title}
                    placeholder={t("auth.content.postEditor.titlePlaceholder")}
                    autoComplete="off"
                    disabled={saveMutation.isPending}
                    required
                    maxLength={255}
                    className="rounded-md focus-visible:ring-2"
                    onChange={(event) =>
                      handleTextFieldChange("title", event.target.value)
                    }
                  />
                </Field>

                <Field className="lg:min-h-0 lg:flex-1">
                  <FieldLabel htmlFor="post-content">
                    {t("auth.content.postEditor.content")}
                  </FieldLabel>
                  <Textarea
                    id="post-content"
                    value={formValues.content}
                    placeholder={t(
                      "auth.content.postEditor.contentPlaceholder"
                    )}
                    disabled={saveMutation.isPending}
                    required
                    rows={12}
                    className="scrollbar-none field-sizing-fixed resize-y rounded-md lg:min-h-0 lg:flex-1 lg:resize-none"
                    onChange={(event) =>
                      handleTextFieldChange("content", event.target.value)
                    }
                  />
                </Field>
              </FieldGroup>

              <FieldGroup className="scrollbar-none gap-2 border-t p-4 lg:min-h-0 lg:overflow-y-auto lg:border-t-0">
                <Field>
                  <FieldLabel htmlFor="post-summary">
                    {t("auth.content.postEditor.summary")}
                  </FieldLabel>
                  <Textarea
                    id="post-summary"
                    value={formValues.summary}
                    placeholder={t(
                      "auth.content.postEditor.summaryPlaceholder"
                    )}
                    disabled={saveMutation.isPending}
                    maxLength={500}
                    className="field-sizing-fixed min-h-24 resize-y rounded-md focus-visible:ring-2"
                    onChange={(event) =>
                      handleTextFieldChange("summary", event.target.value)
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="post-slug">
                    {t("auth.content.postEditor.slug")}
                  </FieldLabel>
                  <Input
                    id="post-slug"
                    value={formValues.slug}
                    placeholder={t("auth.content.postEditor.slugPlaceholder")}
                    autoComplete="off"
                    disabled={saveMutation.isPending}
                    required
                    maxLength={255}
                    className="rounded-md focus-visible:ring-2"
                    onChange={(event) =>
                      handleTextFieldChange("slug", event.target.value)
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="post-cover">
                    {t("auth.content.postEditor.cover")}
                  </FieldLabel>
                  <Input
                    id="post-cover"
                    value={formValues.cover}
                    placeholder={t("auth.content.postEditor.coverPlaceholder")}
                    autoComplete="off"
                    disabled={saveMutation.isPending}
                    maxLength={255}
                    className="rounded-md focus-visible:ring-2"
                    onChange={(event) =>
                      handleTextFieldChange("cover", event.target.value)
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="post-category">
                    {t("auth.content.postEditor.category")}
                  </FieldLabel>
                  <Select
                    value={formValues.categoryId}
                    disabled={saveMutation.isPending || categories.length === 0}
                    onValueChange={(categoryId) =>
                      setFormValues((current) => ({
                        ...current,
                        categoryId,
                      }))
                    }
                  >
                    <SelectTrigger
                      id="post-category"
                      className="w-full rounded-md"
                    >
                      <SelectValue
                        placeholder={t(
                          "auth.content.postEditor.categoryPlaceholder"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      align="start"
                      className="rounded-md"
                    >
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                          className="rounded-none p-2"
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {categories.length === 0 ? (
                    <FieldDescription>
                      {t("auth.content.postEditor.noCategories")}
                    </FieldDescription>
                  ) : null}
                </Field>

                <FieldSet>
                  <FieldLegend variant="label">
                    {t("auth.content.postEditor.tags")}
                  </FieldLegend>

                  <div className="scrollbar-none max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
                    {tags.length > 0 ? (
                      tags.map((tag) => {
                        const checkboxId = `post-tag-${tag.id}`

                        return (
                          <label
                            key={tag.id}
                            htmlFor={checkboxId}
                            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-muted"
                          >
                            <Checkbox
                              id={checkboxId}
                              checked={formValues.tagIds.includes(tag.id)}
                              disabled={saveMutation.isPending}
                              onCheckedChange={(checked) =>
                                handleTagChange(tag.id, checked === true)
                              }
                            />
                            <span className="min-w-0 truncate">{tag.name}</span>
                          </label>
                        )
                      })
                    ) : (
                      <p className="px-2 py-3 text-center text-sm text-muted-foreground">
                        {t("auth.content.postEditor.noTags")}
                      </p>
                    )}
                  </div>
                </FieldSet>

                <Field
                  orientation="horizontal"
                  className="items-center rounded-md border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <FieldLabel htmlFor="post-published">
                      {t("auth.content.postEditor.publish")}
                    </FieldLabel>
                    <FieldDescription>
                      {formValues.isPublished
                        ? t("auth.content.status.published")
                        : t("auth.content.status.draft")}
                    </FieldDescription>
                  </div>
                  <Switch
                    id="post-published"
                    checked={formValues.isPublished}
                    disabled={saveMutation.isPending}
                    onCheckedChange={(isPublished) =>
                      setFormValues((current) => ({
                        ...current,
                        isPublished,
                      }))
                    }
                  />
                </Field>
              </FieldGroup>
            </div>

            <DialogFooter className="m-0 shrink-0 rounded-none border-t bg-muted/30 p-4">
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
                  ? t("auth.content.postEditor.saving")
                  : t("common.save")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
