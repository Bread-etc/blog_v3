import { lazy } from "react"
import { createBrowserRouter } from "react-router-dom"

import AdminLayout from "@/layouts/AdminLayout"
import RootLayout from "@/layouts/RootLayout"
import Home from "@/pages/home"
import ErrorElement from "@/router/ErrorElement"

// 懒加载配置
const PostDetailPage = lazy(() => import("@/pages/posts"))
const ArchivePage = lazy(() => import("@/pages/archive"))
const LinksPage = lazy(() => import("@/pages/links"))
const AboutPage = lazy(() => import("@/pages/about"))
const LoginPage = lazy(() => import("@/pages/login"))
const Overview = lazy(() => import("@/pages/admin/overview"))
const Content = lazy(() => import("@/pages/admin/content"))
const Community = lazy(() => import("@/pages/admin/community"))
const Settings = lazy(() => import("@/pages/admin/settings"))

// 定义路由配置
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorElement />,
    children: [
      {
        index: true,
        element: <Home />,
        handle: {
          title: "nav.home",
        },
      },
      {
        path: "posts/:slug",
        element: <PostDetailPage />,
        handle: {
          title: "post.navTitle",
        },
      },
      {
        path: "archive",
        element: <ArchivePage />,
        handle: {
          title: "nav.archive",
        },
      },
      {
        path: "links",
        element: <LinksPage />,
        handle: {
          title: "nav.links",
        },
      },
      {
        path: "about",
        element: <AboutPage />,
        handle: {
          title: "nav.about",
        },
      },
      {
        path: "login",
        element: <LoginPage />,
        handle: {
          title: "nav.login",
          hideFooter: true,
          backTo: "/",
        },
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    errorElement: <ErrorElement />,
    children: [
      {
        path: "overview",
        element: <Overview />,
        handle: {
          title: "auth.nav.overview",
        },
      },
      {
        path: "content",
        element: <Content />,
        handle: {
          title: "auth.nav.content",
        },
      },
      {
        path: "community",
        element: <Community />,
        handle: {
          title: "auth.nav.community",
        },
      },
      {
        path: "settings",
        element: <Settings />,
        handle: {
          title: "auth.nav.settings",
        },
      },
    ],
  },
])

export default router
