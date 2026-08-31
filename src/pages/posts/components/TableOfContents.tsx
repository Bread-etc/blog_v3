import { memo, useEffect, useRef, useState, type MouseEvent } from "react"
import { useTranslation } from "react-i18next"

import { cn } from "@/lib/utils"
import type { MarkdownHeading } from "@/pages/posts/markdown"

// 与 TOC 的 top-28、正文标题的 scroll-mt-28 保持一致
const HEADING_OFFSET_PX = 112
const TOC_SCROLL_PADDING_PX = 8
const TOC_TITLE_ID = "post-table-of-contents-title"

interface TableOfContentsProps {
  headings: MarkdownHeading[]
  className?: string
}

function TableOfContents({ headings, className }: TableOfContentsProps) {
  const { t } = useTranslation()
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "")
  const tocRef = useRef<HTMLElement>(null)
  const activeLinkRef = useRef<HTMLAnchorElement>(null)

  // 根据页面滚动位置更新 activeId
  useEffect(() => {
    let animationFrame = 0

    function updateActiveHeading() {
      // 取消上一帧未执行的任务，避免一次滚动触发大量重复计算
      cancelAnimationFrame(animationFrame)

      // 在下一个浏览器绘制帧中读取所有标题的位置
      animationFrame = requestAnimationFrame(() => {
        // 默认选中第一项，并寻找最后一个越过顶部基准线的标题
        let nextActiveId = headings[0]?.id ?? ""

        for (const heading of headings) {
          const element = document.getElementById(heading.id)
          if (!element) {
            continue
          }

          if (element.getBoundingClientRect().top <= HEADING_OFFSET_PX) {
            nextActiveId = heading.id
          } else {
            break
          }
        }

        const hasReachedPageBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 1

        if (hasReachedPageBottom) {
          nextActiveId = headings.at(-1)?.id ?? nextActiveId
        }

        setActiveId(nextActiveId)
      })
    }

    updateActiveHeading()

    // 组件挂载或 headings 变化后，注册 scroll 和 resize 监听
    window.addEventListener("scroll", updateActiveHeading, {
      passive: true,
    })
    window.addEventListener("resize", updateActiveHeading)

    // 清理未执行的动画帧和事件监听
    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("scroll", updateActiveHeading)
      window.removeEventListener("resize", updateActiveHeading)
    }
  }, [headings])

  // 当前目录项越界时，仅滚动 TOC 容器使其重新可见
  useEffect(() => {
    const container = tocRef.current
    const activeLink = activeLinkRef.current

    if (!container || !activeLink) {
      return
    }

    const containerRect = container.getBoundingClientRect()
    const linkRect = activeLink.getBoundingClientRect()
    let scrollOffset = 0

    if (linkRect.top < containerRect.top + TOC_SCROLL_PADDING_PX) {
      scrollOffset = linkRect.top - containerRect.top - TOC_SCROLL_PADDING_PX
    } else if (linkRect.bottom > containerRect.bottom - TOC_SCROLL_PADDING_PX) {
      scrollOffset =
        linkRect.bottom - containerRect.bottom + TOC_SCROLL_PADDING_PX
    }

    if (scrollOffset === 0) {
      return
    }

    container.scrollBy({ top: scrollOffset })
  }, [activeId])

  function handleHeadingClick(
    event: MouseEvent<HTMLAnchorElement>,
    id: string
  ) {
    // 遇到特殊点击无需接管
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    const element = document.getElementById(id)
    if (!element) {
      return
    }

    event.preventDefault()
    element.scrollIntoView({
      behavior: "auto",
      block: "start",
    })

    window.history.replaceState(
      window.history.state,
      "",
      `#${encodeURIComponent(id)}`
    )

    setActiveId(id)
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <aside
      ref={tocRef}
      aria-labelledby={TOC_TITLE_ID}
      className={cn(
        "sticky top-28 scrollbar-none max-h-[calc(100vh-8rem)] overflow-y-auto",
        className
      )}
    >
      <h2 id={TOC_TITLE_ID} className="mb-2 text-sm font-semibold">
        {t("post.toc.title")}
      </h2>

      <nav aria-labelledby={TOC_TITLE_ID}>
        <ul className="border-l border-border">
          {headings.map((heading) => {
            const isActive = heading.id === activeId

            return (
              <li key={heading.id}>
                <a
                  ref={isActive ? activeLinkRef : undefined}
                  href={`#${encodeURIComponent(heading.id)}`}
                  aria-current={isActive ? "location" : undefined}
                  onClick={(event) => handleHeadingClick(event, heading.id)}
                  className={cn(
                    "block border-l-2 border-transparent py-1.5 pl-4 text-sm leading-5 text-muted-foreground transition-colors",
                    "wrap-break-word hover:text-foreground",
                    "focus-visible:rounded-md focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
                    heading.level === 3 && "pl-6 text-xs",
                    isActive && "border-primary text-foreground"
                  )}
                >
                  {heading.text}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default memo(TableOfContents)
