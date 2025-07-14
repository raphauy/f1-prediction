"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

interface WorkspaceHeaderProps {
  user: {
    id: string
    name: string | null
    email: string
    role: string
    image?: string | null
  }
}

export function WorkspaceHeader({ user }: WorkspaceHeaderProps) {
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/w" className="text-xl font-bold">
              RC Starter Kit
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/w" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {user.role === "superadmin" ? "Todos los Workspaces" : "Mis Workspaces"}
            </Link>
            {user.role === "superadmin" && (
              <Link 
                href="/admin" 
                className="text-blue-600 hover:text-blue-800 transition-colors font-medium"
              >
                Panel Admin
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            {/* User Menu */}
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {user.image && (
                    <AvatarImage 
                      src={user.image} 
                      alt={user.name || user.email}
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback>
                    {getInitials(user.name, user.email)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{user.name || "Sin nombre"}</p>
                    {user.role === "superadmin" && (
                      <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Superadmin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/w/profile" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/w/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}