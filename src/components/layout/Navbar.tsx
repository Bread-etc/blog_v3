import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"

import { Undo03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import imgSrc from "@/assets/images/avatar.png"
import ThemeToggle from "@/components/layout/ThemeToggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface NavbarProps {
  variant?: "default" | "subpage"
  pageTitle: string
  backTo?: string
}

export default function Navbar({
  variant = "default",
  pageTitle,
  backTo,
}: NavbarProps) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="glass-effect rounded-2xl border border-border px-3 py-2.5 transition-all">
        {variant === "default" ? (
          <DefaultNavbarContent />
        ) : (
          <SubpageNavbarContent pageTitle={pageTitle} backTo={backTo} />
        )}
      </div>
    </div>
  )
}

function DefaultNavbarContent() {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-4">
      <Link
        to="/"
        aria-label={t("nav.home")}
        className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar className="size-8">
          <AvatarImage src={imgSrc} alt={t("nav.avatarAlt")} />
          <AvatarFallback>B</AvatarFallback>
        </Avatar>
      </Link>

      <nav
        aria-label={t("nav.primaryNavigation")}
        className="flex-center flex-1 gap-4 sm:gap-6"
      >
        <NavLinkItem to="/archive" label={t("nav.archive")} />
        <NavLinkItem to="/links" label={t("nav.links")} />
        <NavLinkItem to="/about" label={t("nav.about")} />
      </nav>

      <div className="shrink-0">
        <ThemeToggle />
      </div>
    </div>
  )
}

function SubpageNavbarContent({
  pageTitle,
  backTo,
}: {
  pageTitle: string
  backTo?: string
}) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  function handleBack() {
    if (backTo) {
      navigate(backTo, { replace: true })
      return
    }

    const historyIndex = window.history.state?.idx

    if (typeof historyIndex === "number" && historyIndex > 0) {
      navigate(-1)
    } else {
      navigate("/", { replace: true })
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t("nav.back")}
        title={t("nav.back")}
        onClick={handleBack}
        className="shrink-0"
      >
        <HugeiconsIcon
          icon={Undo03Icon}
          className="size-4.5"
          aria-hidden="true"
        />
      </Button>

      <div className="min-w-0 flex-1 text-center">
        <span className="block truncate text-sm font-medium text-muted-foreground">
          {pageTitle}
        </span>
      </div>

      <div className="shrink-0">
        <ThemeToggle />
      </div>
    </div>
  )
}

function NavLinkItem({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
    >
      {label}
    </Link>
  )
}
