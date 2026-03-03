'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  Plus,
  Inbox,
  HelpCircle,
  ClipboardList,
} from "lucide-react"

type NavItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: ("ASSESSOR" | "REVIEWER")[]
  badge?: string | number
}

type Props = {
  userRole: "ASSESSOR" | "REVIEWER"
  pendingSubmissionsCount?: number
}

export function DashboardSidebar({ userRole, pendingSubmissionsCount = 0 }: Props) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Leads",
      href: "/dashboard/leads",
      icon: FileText,
    },
    {
      name: "Approvals",
      href: "/dashboard/organic-submissions",
      icon: Inbox,
      roles: ["REVIEWER"],
      badge: pendingSubmissionsCount || undefined,
    },
    {
      name: "Reviews",
      href: "/dashboard/reviews",
      icon: BarChart3,
      roles: ["REVIEWER"],
    },
    {
      name: "Questionnaire",
      href: "/dashboard/questionnaire",
      icon: ClipboardList,
      roles: ["REVIEWER"],
    },
    {
      name: "Scoring Guide",
      href: "/dashboard/scoring-guide",
      icon: HelpCircle,
      roles: ["REVIEWER"],
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  )

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="glass relative flex h-screen w-64 flex-col border-r border-foreground/10">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-foreground/10 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">IRA</span>
          </div>
          <span className="text-lg font-bold text-foreground transition-colors">IPO Ready</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {filteredItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-75 ${active
                ? "bg-primary text-primary-foreground"
                : "text-foreground/90 hover:text-foreground hover:bg-foreground/5"
                }`}
              suppressHydrationWarning
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.badge ? (
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          )
        })}

        {/* Quick Actions */}
        <div className="mt-6 space-y-2 border-t border-foreground/10 pt-4">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-foreground/50 transition-colors">
            Quick Actions
          </p>
          {userRole === "REVIEWER" && (
            <Link
              href="/dashboard/leads/new"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
            >
              <Plus className="h-5 w-5 shrink-0" />
              <span>New Lead</span>
            </Link>
          )}
        </div>
      </nav>
    </aside>
  )
}
