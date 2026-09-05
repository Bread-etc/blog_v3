const STORAGE_KEY = "scroll-positions"
const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  " ",
])

let positions: Map<string, number> | undefined

interface ScrollRestorationOptions {
  key: string
  hash: string
  restorePosition: boolean
}

export function createScrollRestoration({
  key,
  hash,
  restorePosition,
}: ScrollRestorationOptions) {
  const savedPositions = getScrollPositions()
  const savedTop = restorePosition ? savedPositions.get(key) : undefined
  let pending = savedTop !== undefined || Boolean(hash)
  let lastTop = savedTop ?? 0
  let disposed = false

  function rememberPosition() {
    if (!pending) {
      lastTop = window.scrollY
      savedPositions.set(key, lastTop)
    }
  }

  function persistPositions() {
    if (!pending) savedPositions.set(key, lastTop)

    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...savedPositions])
      )
    } catch {
      // In-memory restoration still works when storage is unavailable.
    }
  }

  function removeInteractionListeners() {
    window.removeEventListener("wheel", interrupt)
    window.removeEventListener("touchstart", interrupt)
    window.removeEventListener("pointerdown", interrupt)
    window.removeEventListener("keydown", interrupt)
  }

  function finish() {
    pending = false
    removeInteractionListeners()
    rememberPosition()
  }

  function interrupt(event: Event) {
    if (event.type === "keydown") {
      const keyboardEvent = event as KeyboardEvent
      if (
        keyboardEvent.ctrlKey ||
        keyboardEvent.metaKey ||
        keyboardEvent.altKey ||
        !SCROLL_KEYS.has(keyboardEvent.key)
      ) {
        return
      }
    }

    finish()
  }

  function ready() {
    if (!pending || disposed) return

    // A saved reading position takes precedence over an earlier TOC hash.
    if (savedTop !== undefined) {
      window.scrollTo({ left: 0, top: savedTop, behavior: "instant" })
    } else {
      let target: HTMLElement | null = null
      try {
        target = document.getElementById(decodeURIComponent(hash.slice(1)))
      } catch {
        // Invalid URL fragments fall back to the top of the page.
      }

      if (target) {
        target.scrollIntoView({ behavior: "instant", block: "start" })
      } else {
        window.scrollTo({ left: 0, top: 0, behavior: "instant" })
      }
    }

    finish()
  }

  function handlePageHide() {
    rememberPosition()
    persistPositions()
  }

  window.addEventListener("scroll", rememberPosition, { passive: true })
  window.addEventListener("pagehide", handlePageHide)

  if (pending) {
    window.addEventListener("wheel", interrupt, { passive: true })
    window.addEventListener("touchstart", interrupt, { passive: true })
    window.addEventListener("pointerdown", interrupt, { passive: true })
    window.addEventListener("keydown", interrupt)
  } else {
    window.scrollTo({ left: 0, top: 0, behavior: "instant" })
    rememberPosition()
  }

  return {
    ready,
    dispose() {
      if (disposed) return
      disposed = true

      // The next page may already have shortened the document during cleanup.
      persistPositions()
      window.removeEventListener("scroll", rememberPosition)
      window.removeEventListener("pagehide", handlePageHide)
      removeInteractionListeners()
    },
  }
}

function getScrollPositions() {
  if (positions) return positions

  positions = new Map()
  try {
    const stored: unknown = JSON.parse(
      window.sessionStorage.getItem(STORAGE_KEY) ?? "[]"
    )

    if (Array.isArray(stored)) {
      for (const entry of stored) {
        if (
          Array.isArray(entry) &&
          typeof entry[0] === "string" &&
          typeof entry[1] === "number" &&
          Number.isFinite(entry[1]) &&
          entry[1] >= 0
        ) {
          positions.set(entry[0], entry[1])
        }
      }
    }
  } catch {
    // Ignore unavailable storage or an invalid previous snapshot.
  }

  return positions
}
