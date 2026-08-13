import { useTranslation } from "react-i18next"

import { Moon02Icon, Sun02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { useThemeTransition } from "@/hooks/useThemeTransition"

export default function ThemeToggle() {
  const { t } = useTranslation()
  const { theme, toggleThemeWithTransition } = useThemeTransition()
  const isDark = theme === "dark"
  const label = isDark ? t("nav.lightMode") : t("nav.darkMode")

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      title={label}
      onClick={toggleThemeWithTransition}
      className="flex-center border-0 bg-transparent text-foreground shadow-none outline-0 transition-colors hover:bg-transparent hover:text-primary"
    >
      <HugeiconsIcon
        icon={isDark ? Sun02Icon : Moon02Icon}
        className="size-4.5 transition-transform duration-400"
        aria-hidden="true"
      />
    </Button>
  )
}
