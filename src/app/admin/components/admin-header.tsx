"use client"

import { useTransition } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User } from "lucide-react"
import { logoutAction } from "../actions"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export function AdminHeader() {
  const { data: session } = useSession()
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
    })
  }

  const userInitials = session?.user?.name 
    ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : session?.user?.email?.[0].toUpperCase() || 'U'

  return (
    <header className="border-b bg-background py-4">
      <div className="max-w-none lg:max-w-6xl lg:mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold">Panel de Control</h1>
                <p className="text-sm text-muted-foreground">Bienvenido de nuevo, {session?.user?.name || session?.user?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 w-10 rounded-full">
                    <Avatar className="h-8 w-8">
                      {session?.user?.image && (
                        <AvatarImage 
                          src={session.user.image} 
                          alt={session.user.name || session.user.email || 'Usuario'}
                          className="object-cover"
                        />
                      )}
                      <AvatarFallback className="bg-blue-500 text-white">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {session?.user?.name || 'Usuario Admin'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/w/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    disabled={isPending}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isPending ? "Cerrando sesión..." : "Cerrar sesión"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </div>
      </div>
    </header>
  )
}