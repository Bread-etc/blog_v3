import { Moon02Icon, Sun02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { useThemeTransition } from "@/hooks/useThemeTransition"

export default function ThemeToggle() {
  const { theme, toggleThemeWithTransition } = useThemeTransition()
  const isDark = theme === "dark"

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleThemeWithTransition}
      className="flex-center border-0 bg-transparent text-foreground shadow-none outline-0 transition-colors hover:bg-transparent hover:text-primary"
    >
      <HugeiconsIcon
        icon={isDark ? Sun02Icon : Moon02Icon}
        className="size-4.5 transition-transform duration-400"
      />
    </Button>
  )
}
