"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Users,
  FileText,
  Calculator,
  Calendar,
  BarChart3,
  MessageSquare,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Building2,
  Workflow,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Klien",
    href: "/clients",
    icon: Users,
  },
  {
    name: "Dokumen",
    href: "/documents",
    icon: FileText,
  },
  {
    name: "Lembar Kerja",
    href: "/worksheets",
    icon: Calculator,
  },
  {
    name: "Generator SPT",
    href: "/spt-generator",
    icon: Building2,
  },
  {
    name: "Kalender",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Konsultasi",
    href: "/consultation",
    icon: MessageSquare,
  },
  {
    name: "Invoicing",
    href: "/invoicing",
    icon: Receipt,
  },
  {
    name: "Workflow",
    href: "/workflow",
    icon: Workflow,
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className={cn("flex flex-col bg-card border-r transition-all duration-300", collapsed ? "w-16" : "w-64")}>
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Calculator className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">TaxMate</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", collapsed && "px-2")}
                >
                  <Icon className="h-4 w-4" />
                  {!collapsed && <span className="ml-2">{item.name}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
