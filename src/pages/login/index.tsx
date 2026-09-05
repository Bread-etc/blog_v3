import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"

import {
  ArrowRight02Icon,
  Loading03Icon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useMutation } from "@tanstack/react-query"

import { ScrollRestorationReady } from "@/components/layout/PublicScrollRestoration"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { encryptWithPublicKey } from "@/lib/crypto"
import { getPublicKey, login } from "@/services/api/auth"
import { useUserStore } from "@/store/userStore"

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setAuth = useUserStore((state) => state.setAuth)

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const loginMutation = useMutation({
    mutationFn: async () => {
      const { publicKey } = await getPublicKey()
      const encryptedPassword = encryptWithPublicKey(publicKey, password)

      return login({
        username: username.trim(),
        password: encryptedPassword,
      })
    },
    onSuccess: (result) => {
      setAuth({
        token: result.token,
        userInfo: {
          username: result.user.username,
          role: result.user.role,
        },
      })
      navigate("/admin/overview")
    },
  })

  const canSubmit = username.trim().length > 0 && password.length > 0
  const errorMessage =
    loginMutation.error instanceof Error
      ? loginMutation.error.message
      : t("error.default.description")

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canSubmit || loginMutation.isPending) {
      return
    }

    loginMutation.mutate()
  }

  function handleUsernameChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (loginMutation.isError) {
      loginMutation.reset()
    }

    setUsername(event.target.value)
  }

  function handlePasswordChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (loginMutation.isError) {
      loginMutation.reset()
    }

    setPassword(event.target.value)
  }

  return (
    <div className="flex-center px-4 py-12">
      <ScrollRestorationReady />
      <div className="w-full max-w-md rounded-lg border-2 border-border bg-card p-6 shadow-2xl backdrop-blur-sm sm:p-10 sm:px-12">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
            {t("auth.login.title")}
          </h1>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* 用户名 */}
          <Field className="gap-1">
            <FieldLabel htmlFor="username">
              {t("auth.login.username")}
            </FieldLabel>
            <Input
              id="username"
              autoComplete="username"
              value={username}
              placeholder={t("auth.login.usernameHolder")}
              className="h-10 rounded-lg border-border shadow-none outline-none focus-visible:border-primary focus-visible:ring-2"
              onChange={handleUsernameChange}
            />
          </Field>
          {/* 密码 */}
          <Field className="gap-1">
            <FieldLabel htmlFor="password">
              {t("auth.login.password")}
            </FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                placeholder={t("auth.login.passwordHolder")}
                className="h-10 rounded-lg border-border pr-10 shadow-none outline-none focus-visible:border-primary focus-visible:ring-2"
                onChange={handlePasswordChange}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={
                  showPassword
                    ? t("auth.login.hidePassword")
                    : t("auth.login.showPassword")
                }
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg text-muted-foreground hover:bg-transparent hover:text-foreground"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                <HugeiconsIcon
                  icon={showPassword ? ViewOffIcon : ViewIcon}
                  className="size-4.5"
                />
              </Button>
            </div>
          </Field>

          {loginMutation.isError && (
            <FieldError className="">{errorMessage}</FieldError>
          )}

          <Button
            type="submit"
            className="mt-4 h-10 w-full rounded-xl"
            disabled={!canSubmit || loginMutation.isPending}
          >
            <span>
              {loginMutation.isPending
                ? t("auth.login.submitting")
                : t("auth.login.submit")}
            </span>
            {!loginMutation.isPending ? (
              <HugeiconsIcon icon={ArrowRight02Icon} className="size-4.5" />
            ) : (
              <HugeiconsIcon
                icon={Loading03Icon}
                className="size-4.5 animate-spin"
              />
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
