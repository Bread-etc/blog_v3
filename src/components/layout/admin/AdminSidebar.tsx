import { useTranslation } from "react-i18next"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { Logout03Icon, Moon02Icon, Sun02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import imgSrc from "@/assets/images/avatar.png"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { useThemeTransition } from "@/hooks/useThemeTransition"
import { useUserStore } from "@/store/userStore"

import { adminNavItems } from "./admin-nav"

export default function AdminSidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useUserStore((state) => state.logout)
  const { theme, toggleThemeWithTransition } = useThemeTransition()
  const isDark = theme === "dark"
  const { isMobile, setOpenMobile } = useSidebar()

  function handleNavigate() {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  function handleLogout() {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link to="/admin/overview" onClick={handleNavigate}>
                <Avatar className="size-8">
                  <AvatarImage
                    src={imgSrc}
                    alt="avatar"
                    className="rounded-md"
                  />
                </Avatar>
                <div className="truncate text-base font-semibold">
                  Creator Studio
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => {
                const isActive = location.pathname === item.to

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="my-px h-12 rounded-md p-4 text-base data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                    >
                      <Link to={item.to} onClick={handleNavigate}>
                        <HugeiconsIcon icon={item.icon} className="size-4.5!" />
                        <span className="mt-0.5">{t(item.label)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="mx-0" />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleThemeWithTransition}
              className="my-px h-12 rounded-md p-4 text-base"
            >
              <HugeiconsIcon
                icon={isDark ? Sun02Icon : Moon02Icon}
                className="size-4.5!"
              />
              <span className="mt-0.5">
                {isDark ? t("auth.nav.lightMode") : t("auth.nav.darkMode")}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {/* 登出 */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="my-px h-12 rounded-md p-4 text-base hover:bg-destructive/10 hover:text-destructive data-[active=true]:bg-destructive/10 data-[active=true]:text-primary"
            >
              <HugeiconsIcon icon={Logout03Icon} className="size-4.5!" />
              <span className="mt-0.5">{t("auth.nav.logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
