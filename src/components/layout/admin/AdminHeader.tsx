import { SidebarTrigger } from "@/components/ui/sidebar"

interface AdminHeaderProps {
  title: string
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="flex h-14 items-center p-4">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-medium">{title}</h1>
        </div>
        <SidebarTrigger />
      </div>
    </header>
  )
}
