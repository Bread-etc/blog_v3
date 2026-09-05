import { Trans, useTranslation } from "react-i18next"

import {
  CodeIcon,
  HeadphonesIcon,
  KeyboardIcon,
  Mouse01Icon,
  TerminalIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import avatarSrc from "@/assets/images/avatar.png"
import { ScrollRestorationReady } from "@/components/layout/PublicScrollRestoration"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const TECH_GROUPS = [
  {
    labelKey: "about.techStack.work.label",
    valueKey: "about.techStack.work.value",
    descriptionKey: "about.techStack.work.description",
  },
  {
    labelKey: "about.techStack.sideProject.label",
    valueKey: "about.techStack.sideProject.value",
    descriptionKey: "about.techStack.sideProject.description",
  },
  {
    labelKey: "about.techStack.backend.label",
    valueKey: "about.techStack.backend.value",
    descriptionKey: "about.techStack.backend.description",
  },
] as const

const DESK_ITEMS = [
  {
    icon: KeyboardIcon,
    nameKey: "about.desk.keyboard.name",
    typeKey: "about.desk.keyboard.type",
  },
  {
    icon: Mouse01Icon,
    nameKey: "about.desk.mouse.name",
    typeKey: "about.desk.mouse.type",
  },
  {
    icon: HeadphonesIcon,
    nameKey: "about.desk.headphones.name",
    typeKey: "about.desk.headphones.type",
  },
  {
    icon: CodeIcon,
    nameKey: "about.desk.editor.name",
    typeKey: "about.desk.editor.type",
  },
  {
    icon: TerminalIcon,
    nameKey: "about.desk.terminal.name",
    typeKey: "about.desk.terminal.type",
  },
] as const

export default function About() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto w-full">
      <ScrollRestorationReady />
      <header className="sm:grid-cols-[auto_minmax(0, 1fr)] grid items-center gap-6">
        <Avatar className="size-24 sm:size-28">
          <AvatarImage src={avatarSrc} alt={t("about.hero.avatarAlt")} />
          <AvatarFallback>B</AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          <h1 className="text-3xl font-semibold sm:text-4xl">
            <Trans
              i18nKey="about.hero.title"
              components={{
                accent: <span className="text-primary" />,
              }}
            />
          </h1>

          <div className="mt-4 max-w-3xl space-y-1 text-base leading-7 text-muted-foreground">
            <p>{t("about.hero.primary")}</p>
            <p>{t("about.hero.secondary")}</p>
          </div>
        </div>
      </header>

      <section className="mt-14" aria-labelledby="tech-stack-heading">
        <SectionHeading id="tech-stack-heading">
          {t("about.techStack.title")}
        </SectionHeading>

        <div className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {TECH_GROUPS.map((group) => (
            <article
              key={group.labelKey}
              className="py-6 md:px-6 md:first:pl-0 md:last:pr-0"
            >
              <h3 className="text-sm font-medium">{t(group.labelKey)}</h3>
              <p className="mt-3 text-lg font-semibold text-primary">
                {t(group.valueKey)}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t(group.descriptionKey)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="desk-heading">
        <SectionHeading id="desk-heading">
          {t("about.desk.title")}
        </SectionHeading>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {DESK_ITEMS.map((item) => (
            <article
              key={item.nameKey}
              className="flex min-h-32 min-w-0 flex-col rounded-lg border border-border bg-card p-4"
            >
              <HugeiconsIcon
                icon={item.icon}
                className="size-5 text-primary"
                aria-hidden="true"
              />

              <div className="mt-auto pt-5">
                <h3 className="text-sm font-medium wrap-break-word">
                  {t(item.nameKey)}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t(item.typeKey)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="off-hours-heading">
        <SectionHeading id="off-hours-heading">
          {t("about.offHours.title")}
        </SectionHeading>

        <div className="grid divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
          <article className="py-6 md:pr-8">
            <h3 className="font-semibold text-primary">
              {t("about.offHours.games.title")}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t("about.offHours.games.description")}
            </p>
          </article>

          <article className="py-6 md:pl-8">
            <h3 className="font-semibold text-primary">
              {t("about.offHours.music.title")}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {t("about.offHours.music.description")}
            </p>
          </article>
        </div>
      </section>
    </div>
  )
}

interface SectionHeadingProps {
  id: string
  children: string
}

function SectionHeading({ id, children }: SectionHeadingProps) {
  return (
    <div className="border-b border-border pb-3">
      <h2 id={id} className="font-mono text-xs font-medium text-primary">
        / {children}
      </h2>
    </div>
  )
}
