import { useState, type ReactNode, type SubmitEvent } from "react"
import { useTranslation } from "react-i18next"

import {
  Loading03Icon,
  RefreshIcon,
  ResetPasswordIcon,
  SaveIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { encryptWithPublicKey } from "@/lib/crypto"
import { changePassword, getPublicKey } from "@/services/api/auth"
import { getSiteConfig, updateSiteConfig } from "@/services/api/site"
import { HttpError } from "@/services/http/client"
import type { SiteConfig, UpdateSiteConfigRequest } from "@/types/site"

const SITE_CONFIG_QUERY_KEY = ["config"] as const
const MIN_PASSWORD_LENGTH = 8

interface PasswordFormValues {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

type PasswordFieldName = keyof PasswordFormValues

const EMPTY_PASSWORD_FORM: PasswordFormValues = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
}

const HIDDEN_PASSWORDS: Record<PasswordFieldName, boolean> = {
  oldPassword: false,
  newPassword: false,
  confirmPassword: false,
}

function getSiteErrorKey(error: Error) {
  if (error instanceof HttpError) {
    switch (error.errorCode) {
      case "CONFIG_EMAIL_INVALID":
        return "auth.settings.site.emailInvalid"
      case "CONFIG_GITHUB_URL_INVALID":
        return "auth.settings.site.githubUrlInvalid"
    }
  }

  return "auth.settings.site.saveFailed"
}

function getPasswordErrorKey(error: Error) {
  if (error instanceof HttpError) {
    switch (error.errorCode) {
      case "INCORRECT_OLD_PASSWORD":
        return "auth.settings.security.incorrectOldPassword"
      case "INVALID_PASSWORD_ENCRYPTION":
        return "auth.settings.security.encryptionFailed"
      case "PASSWORD_TOO_SHORT":
        return "auth.settings.security.passwordTooShort"
    }
  }

  return "auth.settings.security.updateFailed"
}

function normalizeSiteConfig(values: SiteConfig): UpdateSiteConfigRequest {
  return {
    title: values.title.trim(),
    subtitle: values.subtitle.trim(),
    description: values.description.trim(),
    keywords: values.keywords.trim(),
    author: values.author.trim(),
    email: values.email.trim(),
    githubUrl: values.githubUrl.trim(),
  }
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {children}
    </section>
  )
}

function SettingsState({
  message,
  loading = false,
  onRetry,
}: {
  message: string
  loading?: boolean
  onRetry?: () => void
}) {
  const { t } = useTranslation()

  return (
    <div
      role={loading ? "status" : "alert"}
      className="flex min-h-44 flex-col items-center justify-center gap-3 px-6 py-10 text-center"
    >
      {loading ? (
        <HugeiconsIcon
          icon={Loading03Icon}
          className="size-5 animate-spin text-primary"
          aria-hidden="true"
        />
      ) : null}

      <p className="text-sm text-muted-foreground">{message}</p>

      {!loading && onRetry ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-md"
          onClick={onRetry}
        >
          <HugeiconsIcon icon={RefreshIcon} className="size-4" />
          {t("common.retry")}
        </Button>
      ) : null}
    </div>
  )
}

function SiteConfigurationSection() {
  const { t } = useTranslation()

  const configQuery = useQuery({
    queryKey: SITE_CONFIG_QUERY_KEY,
    queryFn: getSiteConfig,
  })

  return (
    <SettingsSection
      title={t("auth.settings.site.title")}
      description={t("auth.settings.site.description")}
    >
      {configQuery.isPending ? (
        <SettingsState loading message={t("auth.settings.site.loading")} />
      ) : configQuery.isError && !configQuery.data ? (
        <SettingsState
          message={t("auth.settings.site.loadFailed")}
          onRetry={() => void configQuery.refetch()}
        />
      ) : configQuery.data ? (
        <SiteConfigurationForm initialValues={configQuery.data} />
      ) : null}
    </SettingsSection>
  )
}

function SiteConfigurationForm({
  initialValues,
}: {
  initialValues: SiteConfig
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [formValues, setFormValues] = useState<SiteConfig>(() => ({
    ...initialValues,
  }))

  const normalizedValues = normalizeSiteConfig(formValues)
  const hasChanges = (
    Object.keys(normalizedValues) as Array<keyof SiteConfig>
  ).some((key) => normalizedValues[key] !== initialValues[key])

  const saveMutation = useMutation({
    mutationFn: async (values: UpdateSiteConfigRequest) => {
      await updateSiteConfig(values)
      return values
    },
    onSuccess: (savedValues) => {
      setFormValues(savedValues)
      queryClient.setQueryData<SiteConfig>(SITE_CONFIG_QUERY_KEY, savedValues)

      toast.success(t("auth.settings.site.updated"))
    },
    onError: (error) => {
      toast.error(t(getSiteErrorKey(error)))
    },
  })

  function handleFieldChange(field: keyof SiteConfig, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!normalizedValues.title || !hasChanges || saveMutation.isPending) {
      return
    }

    saveMutation.mutate(normalizedValues)
  }

  const disabled = saveMutation.isPending

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-6">
        <Field className="xl:col-span-3">
          <FieldLabel htmlFor="site-title">
            {t("auth.settings.site.siteTitle")}
          </FieldLabel>
          <Input
            id="site-title"
            value={formValues.title}
            placeholder={t("auth.settings.site.siteTitlePlaceholder")}
            disabled={disabled}
            required
            maxLength={100}
            className="h-9 rounded-md"
            onChange={(event) => handleFieldChange("title", event.target.value)}
          />
        </Field>

        <Field className="xl:col-span-3">
          <FieldLabel htmlFor="site-subtitle">
            {t("auth.settings.site.subtitle")}
          </FieldLabel>
          <Input
            id="site-subtitle"
            value={formValues.subtitle}
            placeholder={t("auth.settings.site.subtitlePlaceholder")}
            disabled={disabled}
            maxLength={255}
            className="h-9 rounded-md"
            onChange={(event) =>
              handleFieldChange("subtitle", event.target.value)
            }
          />
        </Field>

        <Field className="md:col-span-2 xl:col-span-6">
          <FieldLabel htmlFor="site-description">
            {t("auth.settings.site.descriptionLabel")}
          </FieldLabel>
          <Textarea
            id="site-description"
            value={formValues.description}
            placeholder={t("auth.settings.site.descriptionPlaceholder")}
            disabled={disabled}
            maxLength={1000}
            rows={4}
            className="field-sizing-fixed min-h-24 resize-y rounded-md"
            onChange={(event) =>
              handleFieldChange("description", event.target.value)
            }
          />
        </Field>

        <Field className="md:col-span-2 xl:col-span-6">
          <FieldLabel htmlFor="site-keywords">
            {t("auth.settings.site.keywords")}
          </FieldLabel>
          <Input
            id="site-keywords"
            value={formValues.keywords}
            placeholder={t("auth.settings.site.keywordsPlaceholder")}
            disabled={disabled}
            maxLength={255}
            className="h-9 rounded-md"
            onChange={(event) =>
              handleFieldChange("keywords", event.target.value)
            }
          />
          <FieldDescription>
            {t("auth.settings.site.keywordsDescription")}
          </FieldDescription>
        </Field>

        <Field className="xl:col-span-2">
          <FieldLabel htmlFor="site-author">
            {t("auth.settings.site.author")}
          </FieldLabel>
          <Input
            id="site-author"
            value={formValues.author}
            placeholder={t("auth.settings.site.authorPlaceholder")}
            autoComplete="name"
            disabled={disabled}
            maxLength={50}
            className="h-9 rounded-md"
            onChange={(event) =>
              handleFieldChange("author", event.target.value)
            }
          />
        </Field>

        <Field className="xl:col-span-2">
          <FieldLabel htmlFor="site-email">
            {t("auth.settings.site.email")}
          </FieldLabel>
          <Input
            id="site-email"
            type="email"
            value={formValues.email}
            placeholder={t("auth.settings.site.emailPlaceholder")}
            autoComplete="email"
            disabled={disabled}
            maxLength={100}
            className="h-9 rounded-md"
            onChange={(event) => handleFieldChange("email", event.target.value)}
          />
        </Field>

        <Field className="md:col-span-2 xl:col-span-2">
          <FieldLabel htmlFor="site-github">
            {t("auth.settings.site.githubUrl")}
          </FieldLabel>
          <Input
            id="site-github"
            type="url"
            value={formValues.githubUrl}
            placeholder={t("auth.settings.site.githubUrlPlaceholder")}
            autoComplete="url"
            disabled={disabled}
            maxLength={255}
            className="h-9 rounded-md"
            onChange={(event) =>
              handleFieldChange("githubUrl", event.target.value)
            }
          />
        </Field>
      </div>

      <div className="flex justify-end border-t border-border px-5 py-4 sm:px-6">
        <Button
          type="submit"
          className="rounded-md px-3"
          disabled={disabled || !normalizedValues.title || !hasChanges}
        >
          <HugeiconsIcon
            icon={disabled ? Loading03Icon : SaveIcon}
            className={disabled ? "size-4 animate-spin" : "size-4"}
          />
          {disabled
            ? t("auth.settings.site.saving")
            : t("auth.settings.site.save")}
        </Button>
      </div>
    </form>
  )
}

function PasswordField({
  id,
  label,
  value,
  autoComplete,
  minLength,
  visible,
  disabled,
  error,
  onChange,
  onToggle,
}: {
  id: string
  label: string
  value: string
  autoComplete: string
  minLength?: number
  visible: boolean
  disabled: boolean
  error?: string
  onChange: (value: string) => void
  onToggle: () => void
}) {
  const { t } = useTranslation()
  const visibilityLabel = visible
    ? t("auth.settings.security.hidePassword")
    : t("auth.settings.security.showPassword")

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          minLength={minLength}
          disabled={disabled}
          required
          aria-invalid={Boolean(error) || undefined}
          className="h-9 rounded-md pr-10"
          onChange={(event) => onChange(event.target.value)}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={disabled}
          aria-label={visibilityLabel}
          title={visibilityLabel}
          className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground active:-translate-y-1/2!"
          onClick={onToggle}
        >
          <HugeiconsIcon
            icon={visible ? ViewOffIcon : ViewIcon}
            className="size-4"
            aria-hidden="true"
          />
        </Button>
      </div>

      {error ? <FieldError>{error}</FieldError> : null}
    </Field>
  )
}

function SecuritySection() {
  const { t } = useTranslation()
  const [formValues, setFormValues] =
    useState<PasswordFormValues>(EMPTY_PASSWORD_FORM)
  const [visibleFields, setVisibleFields] =
    useState<Record<PasswordFieldName, boolean>>(HIDDEN_PASSWORDS)

  const passwordsMatch = formValues.newPassword === formValues.confirmPassword
  const hasPasswordTooShort =
    formValues.newPassword.length > 0 &&
    formValues.newPassword.length < MIN_PASSWORD_LENGTH
  const hasMismatch = formValues.confirmPassword.length > 0 && !passwordsMatch
  const canSubmit =
    formValues.oldPassword.length > 0 &&
    formValues.newPassword.length > 0 &&
    formValues.confirmPassword.length > 0 &&
    !hasPasswordTooShort &&
    passwordsMatch

  const passwordMutation = useMutation({
    mutationFn: async () => {
      const { publicKey } = await getPublicKey()

      await changePassword({
        oldPassword: encryptWithPublicKey(publicKey, formValues.oldPassword),
        newPassword: encryptWithPublicKey(publicKey, formValues.newPassword),
      })
    },
    onSuccess: () => {
      setFormValues(EMPTY_PASSWORD_FORM)
      setVisibleFields(HIDDEN_PASSWORDS)
      toast.success(t("auth.settings.security.updated"))
    },
    onError: (error) => {
      toast.error(t(getPasswordErrorKey(error)))
    },
  })

  function handleFieldChange(field: PasswordFieldName, value: string) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function toggleVisibility(field: PasswordFieldName) {
    setVisibleFields((current) => ({
      ...current,
      [field]: !current[field],
    }))
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit || passwordMutation.isPending) return

    passwordMutation.mutate()
  }

  return (
    <SettingsSection
      title={t("auth.settings.security.title")}
      description={t("auth.settings.security.description")}
    >
      <form onSubmit={handleSubmit}>
        <div className="max-w-3xl p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <PasswordField
                id="current-password"
                label={t("auth.settings.security.currentPassword")}
                value={formValues.oldPassword}
                autoComplete="current-password"
                visible={visibleFields.oldPassword}
                disabled={passwordMutation.isPending}
                onChange={(value) => handleFieldChange("oldPassword", value)}
                onToggle={() => toggleVisibility("oldPassword")}
              />
            </div>

            <PasswordField
              id="new-password"
              label={t("auth.settings.security.newPassword")}
              value={formValues.newPassword}
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              visible={visibleFields.newPassword}
              disabled={passwordMutation.isPending}
              error={
                hasPasswordTooShort
                  ? t("auth.settings.security.passwordTooShort", {
                      min: MIN_PASSWORD_LENGTH,
                    })
                  : undefined
              }
              onChange={(value) => handleFieldChange("newPassword", value)}
              onToggle={() => toggleVisibility("newPassword")}
            />

            <PasswordField
              id="confirm-password"
              label={t("auth.settings.security.confirmPassword")}
              value={formValues.confirmPassword}
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              visible={visibleFields.confirmPassword}
              disabled={passwordMutation.isPending}
              error={
                hasMismatch
                  ? t("auth.settings.security.passwordMismatch")
                  : undefined
              }
              onChange={(value) => handleFieldChange("confirmPassword", value)}
              onToggle={() => toggleVisibility("confirmPassword")}
            />
          </div>
        </div>

        <div className="flex justify-end border-t border-border px-5 py-4 sm:px-6">
          <Button
            type="submit"
            className="rounded-md px-3"
            disabled={!canSubmit || passwordMutation.isPending}
          >
            <HugeiconsIcon
              icon={
                passwordMutation.isPending ? Loading03Icon : ResetPasswordIcon
              }
              className={
                passwordMutation.isPending ? "size-4 animate-spin" : "size-4"
              }
              aria-hidden="true"
            />
            {passwordMutation.isPending
              ? t("auth.settings.security.updating")
              : t("auth.settings.security.update")}
          </Button>
        </div>
      </form>
    </SettingsSection>
  )
}

export default function Settings() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          {t("auth.settings.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("auth.settings.description")}
        </p>
      </div>

      <div className="max-w-6xl space-y-6">
        <SiteConfigurationSection />
        <SecuritySection />
      </div>
    </div>
  )
}
