import {
  ContentWritingIcon,
  DashboardSquare02Icon,
  Link04Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"

export const adminNavItems = [
  {
    id: "overview",
    to: "/admin/overview",
    label: "auth.nav.overview",
    icon: DashboardSquare02Icon,
  },
  {
    id: "content",
    to: "/admin/content",
    label: "auth.nav.content",
    icon: ContentWritingIcon,
  },
  {
    id: "community",
    to: "/admin/community",
    label: "auth.nav.community",
    icon: Link04Icon,
  },
  {
    id: "settings",
    to: "/admin/settings",
    label: "auth.nav.settings",
    icon: Settings01Icon,
  },
] as const
