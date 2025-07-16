"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar"
import {
  Home,
  Users,
  Building2,
  Settings,
  ExternalLink,
  Trophy,
  Flag,
  HelpCircle,
  Calculator,
} from "lucide-react"
// import Image from "next/image"

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
    disabled: false
  },
  {
    title: "Usuarios",
    href: "/admin/users", 
    icon: Users,
    badge: "users",
    disabled: false
  },
  {
    title: "Juegos",
    href: "/admin/workspaces",
    icon: Building2,
    badge: "workspaces",
    disabled: false
  },
  {
    title: "Temporadas F1",
    href: "/admin/seasons",
    icon: Trophy,
    badge: "seasons",
    disabled: false
  },
  {
    title: "Grand Prix",
    href: "/admin/grand-prix",
    icon: Flag,
    badge: "grandprix",
    disabled: false
  },
  {
    title: "Plantillas",
    href: "/admin/question-templates",
    icon: HelpCircle,
    badge: "templates",
    disabled: false
  },
  {
    title: "Puntuación",
    href: "/admin/scoring",
    icon: Calculator,
    disabled: false
  },
  {
    title: "Configuración",
    href: "/admin/settings",
    icon: Settings,
    disabled: true
  }
]

interface AdminSidebarClientProps {
  children: React.ReactNode
  userCount: number
  workspaceCount: number
  seasonCount: number
  grandPrixCount: number
  templateCount: number
}

export function AdminSidebarClient({ children, userCount, workspaceCount, seasonCount, grandPrixCount, templateCount }: AdminSidebarClientProps) {
  const pathname = usePathname()

  const getBadgeCount = (badgeType: string) => {
    switch (badgeType) {
      case "users":
        return userCount
      case "workspaces":
        return workspaceCount
      case "seasons":
        return seasonCount
      case "grandprix":
        return grandPrixCount
      case "templates":
        return templateCount
      default:
        return 0
    }
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        {/* Header with trigger and title like Claude */}
        <SidebarHeader className="flex flex-row items-center justify-between border-b p-2">
          <h2 className="text-lg flex flex-row items-center gap-2 pl-1 font-semibold truncate group-data-[collapsible=icon]:hidden">
            {/* <Image src="/logo.png" alt="Admin" width={32} height={32} /> */}
            Admin
          </h2>
          <SidebarTrigger className="h-8 w-8 shrink-0" />
        </SidebarHeader>
        
        <SidebarContent>
          {/* Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => {
                  const Icon = item.icon
                  
                  if (item.disabled) {
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          disabled
                          isActive={false}
                          tooltip={item.title}
                          className="opacity-50 cursor-not-allowed"
                        >
                          <Icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  }
                  
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={item.title}
                      >
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.badge && getBadgeCount(item.badge) > 0 && (
                        <SidebarMenuBadge>{getBadgeCount(item.badge)}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Acceso Rápido para Superadmin */}
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel>Acceso Rápido</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Ver Todos los Juegos"
                  >
                    <Link href="/w" className="text-blue-600 hover:text-blue-800">
                      <ExternalLink />
                      <span>Todos los Juegos</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarRail />
      </Sidebar>
      
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}