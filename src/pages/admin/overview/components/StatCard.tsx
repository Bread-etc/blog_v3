import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"

type StatTone = "positive" | "negative" | "neutral"
type DatabaseStatus = "up" | "down"

interface BaseStatCardProps {
  title: string
  value: string | number
  icon: IconSvgElement
}

interface MetricStatCardProps extends BaseStatCardProps {
  mode?: "metric"
  hint: string
  tone: StatTone
}

interface DatabaseStatCardProps extends BaseStatCardProps {
  mode: "database"
  status: DatabaseStatus
}

type StatCardProps = MetricStatCardProps | DatabaseStatCardProps

const toneClassName: Record<StatTone, string> = {
  positive: "text-emerald-500 dark:text-emerald-400",
  negative: "text-destructive",
  neutral: "text-muted-foreground",
}

export default function StatCard(props: StatCardProps) {
  if (props.mode === "database") {
    const isUp = props.status === "up"

    return (
      <section className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 text-card-foreground transition-colors hover:border-primary">
        <div className="absolute top-0 right-0 p-2 opacity-10 transition-opacity group-hover:opacity-20">
          <HugeiconsIcon
            icon={props.icon}
            className={`size-16 ${isUp ? "text-emerald-500" : "text-destructive"}`}
          />
        </div>

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div
            className={`flex size-10 items-center justify-center rounded-lg ${
              isUp
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            <HugeiconsIcon icon={props.icon} className="size-6" />
          </div>

          <span className="relative flex size-3">
            {isUp ? (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            ) : null}
            <span
              className={`relative inline-flex size-3 rounded-full ${
                isUp ? "bg-emerald-500" : "bg-destructive"
              }`}
            />
          </span>
        </div>

        <div className="relative z-10 mt-6 space-y-1.5">
          <p className="text-xl leading-none font-semibold">{props.value}</p>
          <p className="text-sm text-muted-foreground">{props.title}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-border bg-card p-4 text-card-foreground transition-colors hover:border-primary">
      <div className="flex items-start justify-between">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <HugeiconsIcon icon={props.icon} className="size-6" />
        </div>

        <span className={`text-xs font-medium ${toneClassName[props.tone]}`}>
          {props.hint}
        </span>
      </div>

      <div className="mt-6 space-y-1.5">
        <p className="text-xl leading-none font-semibold">{props.value}</p>
        <p className="text-sm text-muted-foreground">{props.title}</p>
      </div>
    </section>
  )
}
