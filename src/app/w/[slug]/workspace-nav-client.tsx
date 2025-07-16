"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { BarChart3, Settings, Users, Target, Trophy, Calendar, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserMenu } from "./user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { WorkspaceSelector } from "@/components/workspace-selector"
import type { Workspace } from "@prisma/client"

interface WorkspaceNavClientProps {
  workspaceSlug: string
  isAdmin: boolean
  user: {
    id: string
    name: string | null
    email: string
    role: string
    image?: string | null
  }
  userWorkspaces?: {
    workspace: Workspace
  }[]
  currentWorkspace?: Workspace
}

export function WorkspaceNavClient({ 
  workspaceSlug, 
  isAdmin, 
  user, 
  userWorkspaces,
  currentWorkspace 
}: WorkspaceNavClientProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    {
      label: "Dashboard",
      href: `/w/${workspaceSlug}`,
      icon: BarChart3,
      isActive: pathname === `/w/${workspaceSlug}`,
      showForMembers: true,
      disabled: false,
    },
    {
      label: "Predicciones",
      href: `/w/${workspaceSlug}/predictions`,
      icon: Target,
      isActive: pathname.startsWith(`/w/${workspaceSlug}/predictions`),
      showForMembers: true,
      disabled: false,
    },
    {
      label: "Clasificación",
      href: `/w/${workspaceSlug}/standings`,
      icon: Trophy,
      isActive: pathname === `/w/${workspaceSlug}/standings`,
      showForMembers: true,
      disabled: false,
    },
    {
      label: "Calendario",
      href: `/w/${workspaceSlug}/calendar`,
      icon: Calendar,
      isActive: pathname === `/w/${workspaceSlug}/calendar`,
      showForMembers: true,
      disabled: true,
    },
    {
      label: "Competidores",
      href: `/w/${workspaceSlug}/members`,
      icon: Users,
      isActive: pathname === `/w/${workspaceSlug}/members`,
      showForMembers: true,
      disabled: false,
    },
    {
      label: "Configuración",
      href: `/w/${workspaceSlug}/settings`,
      icon: Settings,
      isActive: pathname === `/w/${workspaceSlug}/settings`,
      showForMembers: false,
      disabled: false,
    },
  ].filter(item => isAdmin || item.showForMembers)

  return (
    <nav className="bg-card border rounded-lg">
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle>Menú de navegación</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col h-full">
                  <div className="space-y-4 py-4">
                    {/* Workspace Selector en mobile */}
                    {userWorkspaces && userWorkspaces.length > 1 && (
                      <div className="px-3 pb-2 border-b">
                        <WorkspaceSelector
                          userWorkspaces={userWorkspaces}
                          currentWorkspace={currentWorkspace}
                          compact={false}
                        />
                      </div>
                    )}
                    
                    {/* Nav Items */}
                    <div className="px-3 space-y-1">
                      {navItems.map((item) => {
                        const Icon = item.icon
                        
                        if (item.disabled) {
                          return (
                            <Button
                              key={item.href}
                              variant="ghost"
                              className="w-full justify-start opacity-50 cursor-not-allowed"
                              disabled
                            >
                              <Icon className="h-4 w-4 mr-2" />
                              <span>{item.label}</span>
                            </Button>
                          )
                        }
                        
                        return (
                          <Button
                            key={item.href}
                            variant={item.isActive ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            asChild
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Link href={item.href}>
                              <Icon className="h-4 w-4 mr-2" />
                              <span>{item.label}</span>
                            </Link>
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Workspace name or selector */}
            {currentWorkspace && (
              <div className="flex items-center">
                <span className="font-medium text-sm truncate max-w-[150px]">
                  {currentWorkspace.name}
                </span>
              </div>
            )}
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:block p-4">
        <div className="flex items-center justify-between">
          {/* Navigation Items */}
          <div className="flex items-center space-x-1">
            {/* Workspace Selector - Solo si hay múltiples workspaces */}
            {userWorkspaces && userWorkspaces.length > 1 && (
              <>
                <div className="flex items-center mr-2">
                  <WorkspaceSelector
                    userWorkspaces={userWorkspaces}
                    currentWorkspace={currentWorkspace}
                    compact
                  />
                </div>
                <div className="h-4 w-px bg-border mx-2" />
              </>
            )}
            
            {navItems.map((item) => {
              const Icon = item.icon
              
              if (item.disabled) {
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    size="sm"
                    disabled
                    className="opacity-50 cursor-not-allowed"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    <span>{item.label}</span>
                  </Button>
                )
              }
              
              return (
                <Button
                  key={item.href}
                  variant={item.isActive ? "default" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link href={item.href} className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </Button>
              )
            })}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <UserMenu user={user} />
          </div>
        </div>
      </div>
    </nav>
  )
}