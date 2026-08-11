import type { MouseEvent } from "react"

import { useThemeStore } from "@/store/themeStore"

type ThemeTransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void> | void) => {
    ready: Promise<void>
  }
}

export const useThemeTransition = () => {
  const { theme, toggleTheme } = useThemeStore()

  const toggleThemeWithTransition = async (event: MouseEvent<HTMLElement>) => {
    const doc = document as ThemeTransitionDocument
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    // 浏览器不支持 View Transition API 或开启了减少动画
    if (!doc.startViewTransition || prefersReducedMotion) {
      toggleTheme()
      return
    }

    const x = event.clientX
    const y = event.clientY
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = doc.startViewTransition(() => {
      toggleTheme()
    })

    await transition.ready

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 400,
        easing: "ease-in",
        pseudoElement: "::view-transition-new(root)",
      }
    )
  }

  return { theme, toggleThemeWithTransition }
}
