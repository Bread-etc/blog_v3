import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import {
  Github01Icon,
  Mail01Icon,
  RedditIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface SocialLinkProps {
  href: string
  label: string
  icon: ReactNode
}

export default function Footer() {
  const startYear = 2024
  const currentYear = new Date().getFullYear()
  const author = "Bread-etc"
  const icp = "粤ICP备2023050288号-1."

  return (
    <div className="mx-auto w-full max-w-2xl py-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-4">
          <SocialLink
            href="https://github.com/Bread-etc"
            label="Github"
            icon={<HugeiconsIcon icon={Github01Icon} className="size-5" />}
          />
          <SocialLink
            href="mailto:zekar@qq.com"
            label="Email"
            icon={<HugeiconsIcon icon={Mail01Icon} className="size-5" />}
          />
          <SocialLink
            href="https://www.reddit.com/user/Fit_Pumpkin619"
            label="Reddit"
            icon={<HugeiconsIcon icon={RedditIcon} className="size-5" />}
          />
        </div>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            Made by{" "}
            <span className="font-medium text-foreground">{author}</span>
          </p>
          <p className="text-xs">
            <Link
              to="/login"
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
