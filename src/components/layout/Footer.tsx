import type { ReactNode } from "react"
import { Trans, useTranslation } from "react-i18next"
import { Link } from "react-router-dom"

import {
  Github01Icon,
  Mail01Icon,
  RedditIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { useSiteConfig } from "@/hooks/useSiteConfig"

const DEFAULT_AUTHOR = "Bread-etc"
const DEFAULT_EMAIL = "zekar@qq.com"
const DEFAULT_GITHUB_URL = "https://github.com/Bread-etc"
const REDDIT_URL = "https://www.reddit.com/user/Fit_Pumpkin619"

interface SocialLinkProps {
  href: string
  label: string
  icon: ReactNode
}

export default function Footer() {
  const { t } = useTranslation()
  const configQuery = useSiteConfig()

  // Variables
  const startYear = 2024
  const currentYear = new Date().getFullYear()
  const icp = "粤ICP备2023050288号-1."
  const config = configQuery.data
  const author = config?.author.trim() || DEFAULT_AUTHOR
  const email = config ? config.email.trim() : DEFAULT_EMAIL
  const githubUrl = config ? config.githubUrl.trim() : DEFAULT_GITHUB_URL

  return (
    <div className="mx-auto w-full max-w-2xl py-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-4">
          {githubUrl ? (
            <SocialLink
              href={githubUrl}
              label={t("common.footer.github")}
              icon={
                <HugeiconsIcon
                  icon={Github01Icon}
                  className="size-5"
                  aria-hidden="true"
                />
              }
            />
          ) : null}
          {email ? (
            <SocialLink
              href={`mailto:${email}`}
              label={t("common.footer.email")}
              icon={
                <HugeiconsIcon
                  icon={Mail01Icon}
                  className="size-5"
                  aria-hidden="true"
                />
              }
            />
          ) : null}
          <SocialLink
            href={REDDIT_URL}
            label={t("common.footer.reddit")}
            icon={
              <HugeiconsIcon
                icon={RedditIcon}
                className="size-5"
                aria-hidden="true"
              />
            }
          />
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            <Trans
              i18nKey="common.footer.madeBy"
              values={{ author }}
              components={{
                author: <span className="font-medium text-foreground" />,
              }}
            />
          </p>
          <p className="text-xs">
            <Link
              to="/login"
              aria-label={t("nav.login")}
              className="mr-0.5 font-medium text-primary transition-colors hover:text-primary/80"
            >
              ©
            </Link>
            <span>
              {startYear}-{currentYear}{" "}
            </span>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
            >
              {icp}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

function SocialLink({ href, label, icon }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="rounded-xl bg-secondary p-2.5 text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      {icon}
    </a>
  )
}
