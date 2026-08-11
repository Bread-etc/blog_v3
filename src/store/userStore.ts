import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

type UserInfo = {
  username: string
  role: string
}

interface UserState {
  token: string | null
  userInfo: UserInfo | null

  // Actions
  setAuth: (payload: { token: string; userInfo: UserInfo }) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      userInfo: null,
      setAuth: ({ token, userInfo }) => set({ token, userInfo }),
      logout: () => set({ token: null, userInfo: null }),
    }),
    {
      name: "userInfo",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        userInfo: state.userInfo,
      }),
    }
  )
)
