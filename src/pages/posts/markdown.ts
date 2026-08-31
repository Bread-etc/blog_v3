import bash from "@shikijs/langs/bash"
import css from "@shikijs/langs/css"
import docker from "@shikijs/langs/docker"
import go from "@shikijs/langs/go"
import html from "@shikijs/langs/html"
import javascript from "@shikijs/langs/javascript"
import json from "@shikijs/langs/json"
import jsx from "@shikijs/langs/jsx"
import markdown from "@shikijs/langs/markdown"
import sql from "@shikijs/langs/sql"
import tsx from "@shikijs/langs/tsx"
import typescript from "@shikijs/langs/typescript"
import vue from "@shikijs/langs/vue"
import yaml from "@shikijs/langs/yaml"
import rehypeShikiFromHighlighter, {
  type RehypeShikiCoreOptions,
} from "@shikijs/rehype/core"
import ayuDark from "@shikijs/themes/ayu-dark"
import ayuLight from "@shikijs/themes/ayu-light"
import GithubSlugger from "github-slugger"
import { toString } from "mdast-util-to-string"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import { createHighlighterCore } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
import { unified, type PluggableList } from "unified"
import { visit } from "unist-util-visit"

export interface MarkdownHeading {
  id: string
  text: string
  level: 2 | 3
}

export const markdownRemarkPlugins: PluggableList = [remarkGfm]

export const markdownHighlighter = createHighlighterCore({
  engine: createJavaScriptRegexEngine(),
  langs: [
    bash,
    css,
    docker,
    go,
    html,
    javascript,
    json,
    jsx,
    markdown,
    sql,
    tsx,
    typescript,
    vue,
    yaml,
  ],
  themes: [ayuLight, ayuDark],
})

const shikiOptions = {
  addLanguageClass: true,
  defaultColor: "light",
  defaultLanguage: "text",
  fallbackLanguage: "text",
  themes: {
    light: "ayu-light",
    dark: "ayu-dark",
  },
  onError(error) {
    console.error("Failed to highlight Markdown code block:", error)
  },
} satisfies RehypeShikiCoreOptions

export function createMarkdownRehypePlugins(
  highlighter: Awaited<typeof markdownHighlighter>
): PluggableList {
  return [rehypeSlug, [rehypeShikiFromHighlighter, highlighter, shikiOptions]]
}

export function extractMarkdownHeadings(content: string): MarkdownHeading[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(content)

  const slugger = new GithubSlugger()
  const headings: MarkdownHeading[] = []

  visit(tree, "heading", (node) => {
    const text = toString(node, { includeHtml: false }).trim()

    if (!text) {
      return
    }

    // rehype-slug 会处理所有标题，因此这里也要先生成每个标题的 slug
    const id = slugger.slug(text)

    // 再筛选目录中需要展示的 h2 和 h3
    if (node.depth !== 2 && node.depth !== 3) {
      return
    }

    headings.push({
      id,
      text,
      level: node.depth,
    })
  })

  return headings
}
