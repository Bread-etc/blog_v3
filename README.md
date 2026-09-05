# blog_v3

基于 React、TypeScript 和 Vite 构建的个人博客前端，包含公开博客与后台内容管理界面。后端 API 由 [`blog_go`](https://github.com/Bread-etc/blog_go) 提供。

## 技术栈

- React 19 + TypeScript
- Vite 8 + Tailwind CSS v4
- React Router
- TanStack React Query
- Zustand
- shadcn/ui + Radix UI
- i18next
- Axios
- React Markdown + Shiki
- GitHub Actions CI/CD

## 功能模块

- 公开页面：首页、归档、文章详情、友链和关于页面
- 文章阅读：Markdown、GFM、代码高亮、目录锚点和滚动位置恢复
- 后台管理：概览、文章、分类、标签、友链和站点设置
- 全局体验：中英文文案、明暗主题、响应式布局和统一错误处理

## 项目结构

```text
src/
  assets/       # 图片等构建资源
  components/   # 通用组件与布局组件
  config/       # 前端环境配置
  hooks/        # 共享 Hooks
  i18n/         # 中英文资源
  layouts/      # 公开与后台布局
  lib/          # 通用逻辑与基础配置
  pages/        # 路由页面
  router/       # React Router 配置
  services/     # HTTP 客户端和 API 模块
  store/        # Zustand 全局状态
  styles/       # 全局样式与主题变量
  types/        # 共享类型
tests/          # 独立逻辑测试
docs/           # 版本记录
```

## 本地开发

前置要求：

- Node.js 24
- pnpm 10.27+
- 可访问的 `blog_go` API

安装依赖：

```powershell
pnpm install
```

创建本地 `.env.development`：

```env
VITE_API_BASE_URL=/api
API_PROXY_TARGET=https://hastur23.top
VITE_SITE_NAME=Bread-etc's Site
```

启动开发服务器：

```powershell
pnpm dev
```

## 检查与构建

```powershell
pnpm test
pnpm run lint
pnpm run build
```

`pnpm test` 当前使用 Node.js 内置测试运行器验证公开页面的滚动位置恢复逻辑。

## CI/CD

工作流位于 `.github/workflows/deploy.yml`。

自动发布条件：

- 推送到 `main` 分支
- 本次推送包含 `docs/CHANGELOG.md` 的修改

也可以通过 `workflow_dispatch` 手动执行。

前端仓库需要配置以下 Repository Variables：

```text
VITE_API_BASE_URL=/api
VITE_SITE_NAME=Bread-etc's Site
```

还需要配置以下 Repository Secrets：

```text
HOST
USERNAME
KEY
```

所有 `VITE_*` 变量都会进入浏览器端构建产物，不得用于保存密码、Token 或私钥。

## 版本发布

1. 完成代码修改和本地检查。
2. 更新 [`docs/CHANGELOG.md`](docs/CHANGELOG.md)。
3. 合并或推送到 `main`，触发生产部署。
4. 部署成功后创建对应的 Git Tag 和 GitHub Release。

## 文档

- 版本记录：[docs/CHANGELOG.md](docs/CHANGELOG.md)
- 后端项目：[Bread-etc/blog_go](https://github.com/Bread-etc/blog_go)
