import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react"
import { useLocation, useNavigationType } from "react-router-dom"

import { createScrollRestoration } from "@/lib/scroll-restoration"

const ScrollReadyContext = createContext<(() => void) | null>(null)

export default function PublicScrollRestoration({
  children,
}: {
  children: ReactNode
}) {
  const navigationType = useNavigationType()
  const { key, hash, pathname, search } = useLocation()
  // 标识需要保留坐标的历史记录
  const entryKey = JSON.stringify([key, pathname, search])
  // 标识本次导航，额外包含锚点和导航类型
  const readinessKey = JSON.stringify([entryKey, hash, navigationType])
  // 记录哪次导航已经报告就绪
  const readyKey = useRef<string | null>(null)
  const restoration = useRef<ReturnType<typeof createScrollRestoration> | null>(
    null
  )

  const handleReady = useCallback(() => {
    readyKey.current = readinessKey
    restoration.current?.ready()
  }, [readinessKey])

  useLayoutEffect(() => {
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = "manual"
    return () => {
      window.history.scrollRestoration = previous
    }
  }, [])

  useLayoutEffect(() => {
    const current = createScrollRestoration({
      key: entryKey,
      hash,
      restorePosition: navigationType === "POP",
    })
    restoration.current = current

    // Child layout effects can report readiness before this effect runs.
    if (readyKey.current === readinessKey) current.ready()

    return () => {
      current.dispose()
      restoration.current = null
      readyKey.current = null
    }
  }, [entryKey, hash, navigationType, readinessKey])

  return (
    <ScrollReadyContext.Provider value={handleReady}>
      {children}
    </ScrollReadyContext.Provider>
  )
}

export function ScrollRestorationReady({ ready = true }: { ready?: boolean }) {
  const notifyReady = useContext(ScrollReadyContext)

  useLayoutEffect(() => {
    if (ready) notifyReady?.()
  }, [notifyReady, ready])

  return null
}
