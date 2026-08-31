import {
  isValidElement,
  memo,
  Suspense,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react"
import { useTranslation } from "react-i18next"

import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import ReactMarkdown, { type Components } from "react-markdown"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  createMarkdownRehypePlugins,
  markdownHighlighter,
  markdownRemarkPlugins,
} from "@/pages/posts/markdown"

interface MarkdownContentProps {
  content: string
  className?: string
}

function isExternalLink(href: string | undefined) {
  return Boolean(href && /^(https?:)?\/\//.test(href))
}

const markdownComponents: Components = {
  // a 标签
  a({ href, title, children }) {
    const external = isExternalLink(href)

    return (
      <a
        href={href}
        title={title}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    )
  },

  // img 图片元素
  img({ src, alt, title }) {
    if (!src) {
      return null
    }

    return (
      <img
        src={src}
        alt={alt ?? ""}
        title={title}
        loading="lazy"
        decoding="async"
        className="my-4! block h-auto max-w-full rounded-md"
      />
    )
  },

  // 代码块
  pre: CodeBlock,

  // 表格
  table({ children }) {
    return (
      <div className="my-6 max-w-full min-w-0 overflow-x-auto rounded-md border border-border">
        <table className="my-0 w-full">{children}</table>
      </div>
    )
  },
}

function MarkdownRenderer({ content, className }: MarkdownContentProps) {
  const highlighter = use(markdownHighlighter)

  const rehypePlugins = useMemo(
    () => createMarkdownRehypePlugins(highlighter),
    [highlighter]
  )

  return (
    <article
      className={cn(
        "prose max-w-none min-w-0 wrap-anywhere prose-neutral dark:prose-invert",
        "prose-headings:scroll-mt-28 prose-headings:font-heading prose-headings:font-semibold prose-headings:tracking-normal",
        "prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2",
        "prose-h3:mt-6 prose-h3:mb-2",
        "prose-p:my-4 prose-p:leading-7",
        "prose-a:font-medium prose-a:text-primary",
        "prose-blockquote:border-primary prose-blockquote:bg-card/80 prose-blockquote:py-2 prose-blockquote:pr-4 prose-blockquote:text-muted-foreground prose-blockquote:not-italic",
        "prose-strong:text-foreground",
        "prose-marker:text-muted-foreground prose-li:leading-7",
        "prose-hr:border-border",
        "prose-table:my-0",
        "prose-th:bg-muted/30 prose-th:px-4 prose-th:py-2",
        "prose-td:px-4 prose-td:py-2",
        "prose-code:rounded-sm prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-foreground",
        "prose-code:before:content-none prose-code:after:content-none",
        "prose-pre:my-0 prose-pre:overflow-x-auto prose-pre:rounded-md prose-pre:border prose-pre:border-border",
        "prose-pre:p-4 prose-pre:pr-12 prose-pre:text-sm prose-pre:leading-6",
        "[&_pre_code]:block [&_pre_code]:min-w-max [&_pre_code]:bg-transparent! [&_pre_code]:p-0!",
        "[&_a:has(>img)]:my-4 [&_a:has(>img)]:block [&_a:has(>img)]:w-fit [&_a:has(>img)]:max-w-full",
        "[&_a>img]:my-0",
        "dark:[&_.shiki]:bg-(--shiki-dark-bg)!",
        "dark:[&_.shiki]:text-(--shiki-dark)!",
        "dark:[&_.shiki_span]:text-(--shiki-dark)!",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={markdownRemarkPlugins}
        rehypePlugins={rehypePlugins}
        components={markdownComponents}
        skipHtml
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}

function CodeBlock({ children, className, style }: ComponentProps<"pre">) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const resetTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
      }
    }
  }, [])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getNodeText(children))
      setCopied(true)

      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
      }

      resetTimerRef.current = window.setTimeout(() => {
        setCopied(false)
        resetTimerRef.current = null
      }, 2000)
    } catch {
      toast.error(t("post.code.copyError"))
    }
  }

  const buttonLabel = copied ? t("post.code.copied") : t("post.code.copy")

  return (
    <div className="group/code relative my-6 min-w-0">
      <pre className={className} style={style}>
        {children}
      </pre>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label={buttonLabel}
        title={buttonLabel}
        onClick={() => void handleCopy()}
        className="absolute top-2 right-2 z-10 bg-background/90 shadow-sm backdrop-blur-sm sm:opacity-0 sm:group-focus-within/code:opacity-100 sm:group-hover/code:opacity-100"
      >
        <HugeiconsIcon
          icon={copied ? Tick02Icon : Copy01Icon}
          className="size-4"
          aria-hidden="true"
        />
      </Button>
    </div>
  )
}

function getNodeText(node: ReactNode): string {
  if (
    typeof node === "string" ||
    typeof node === "number" ||
    typeof node === "bigint"
  ) {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(getNodeText).join("")
  }

  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getNodeText(node.props.children)
  }

  return ""
}

function MarkdownContentFallback() {
  return (
    <div aria-hidden="true" className="py-1">
      <div className="space-y-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-5 w-4/5" />
      </div>

      <Skeleton className="mt-8 h-8 w-2/5" />

      <div className="mt-4 space-y-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-10/12" />
      </div>

      <Skeleton className="mt-6 h-44 w-full rounded-md" />
    </div>
  )
}

function MarkdownContent(props: MarkdownContentProps) {
  return (
    <Suspense fallback={<MarkdownContentFallback />}>
      <MarkdownRenderer {...props} />
    </Suspense>
  )
}

export default memo(MarkdownContent)
