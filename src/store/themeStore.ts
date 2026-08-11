import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export type Theme = "light" | "dark"

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light", // 默认 light 主题

      setTheme: (theme) => {
        set({ theme })
        updateDocumentClass(theme)
      },

      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark"
        set({ theme: next })
        updateDocumentClass(next)
      },
    }),
    {
      name: "theme",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) updateDocumentClass(state.theme)
      },
    }
  )
)

const updateDocumentClass = (theme: Theme) => {
  if (typeof window === "undefined") return
  // TODO: 迁移SSR需要考虑无window的问题
  const root = window.document.documentElement

  if (theme === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
}
