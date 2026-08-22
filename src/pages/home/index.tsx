import { useTranslation } from "react-i18next"

import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useQuery } from "@tanstack/react-query"

import { getPostList } from "@/services/api/post"
import { getSiteConfig } from "@/services/api/site"
import type { GetPostListRequest } from "@/types/post"

import { PostsSkeleton, PostsState } from "./components/HomePostStates"
import PostPreview from "./components/PostPreview"

const HOME_POST_PARAMS = {
  page: 1,
  pageSize: 7,
  isPublished: true,
} satisfies GetPostListRequest

export default function Home() {
  const { t } = useTranslation()

  // 网络请求
  const postsQuery = useQuery({
    queryKey: ["posts", "home", HOME_POST_PARAMS],
    queryFn: () => getPostList(HOME_POST_PARAMS),
  })
  const configQuery = useQuery({
    queryKey: ["config"],
    queryFn: getSiteConfig,
  })

  // Variables
  const posts = postsQuery.data?.list ?? []
  const [featuredPost, ...recentPosts] = posts
  const contactEmail = configQuery.data?.email.trim()

  return (
    <div className="mx-auto w-full">
      <header>
        <span className="inline-flex rounded-sm bg-primary/10 px-2 py-1 text-sm font-medium text-primary">
          {t("home.hero.eyebrow")}
        </span>
        <h1 className="mt-4 text-3xl font-semibold">{t("home.hero.title")}</h1>
        <p className="text-base leading-7 text-muted-foreground">
          {t("home.hero.description")}
        </p>
      </header>

      {postsQuery.isPending ? (
        <PostsSkeleton />
      ) : postsQuery.isError && !postsQuery.data ? (
        <PostsState variant="error" onRetry={() => void postsQuery.refetch()} />
      ) : !featuredPost ? (
        <PostsState variant="empty" />
      ) : (
        <>
          <section className="mt-8" aria-label={t("home.hero.eyebrow")}>
            <PostPreview post={featuredPost} variant="featured" />
          </section>

          {recentPosts.length > 0 ? (
            <section className="mt-16" aria-labelledby="recent-posts-heading">
              <h2 id="recent-posts-heading" className="text-2xl font-semibold">
                {t("home.recent.title")}
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {t("home.recent.description")}
              </p>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recentPosts.map((post) => (
                  <PostPreview key={post.id} post={post} />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      {contactEmail ? (
        <section className="mt-24 mb-12 rounded-lg border border-border bg-card px-6 py-12 text-center sm:px-10 sm:py-14">
          <div className="mx-auto max-w-lg">
            <h2 className="text-xl font-semibold">{t("home.contact.title")}</h2>

            <a
              href={`mailto:${contactEmail}`}
              className="group mt-4 inline-flex items-center gap-2 rounded-sm text-sm font-medium text-primary transition-colors outline-none hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {t("home.contact.action")}
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>
          </div>
        </section>
      ) : null}
    </div>
  )
}
