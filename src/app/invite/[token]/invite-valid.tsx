"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, User, Loader2, LogIn, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { acceptInvitationAction } from "./actions"

interface InviteValidProps {
  invitation: {
    id: string
    token: string
    email: string
    role: string
    workspace: {
      name: string
      slug: string
      description?: string | null
    }
    invitedBy: {
      name: string | null
      email: string
    }
    expiresAt: Date
  }
  userState: {
    isAuthenticated: boolean
    isCurrentUser: boolean
    hasAccount: boolean
    needsOnboarding: boolean
    user: {
      id: string
      email: string
      name?: string | null
      isOnboarded: boolean
    } | null
  }
  session: {
    user: {
      id: string
      email: string
      name?: string | null
    }
  } | null
}

export function InviteValid({ invitation, userState, session }: InviteValidProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge variant="default" className="bg-blue-100 text-blue-800">
        <Shield className="w-3 h-3 mr-1" />
        Administrador
      </Badge>
    ) : (
      <Badge variant="secondary">
        <User className="w-3 h-3 mr-1" />
        Miembro
      </Badge>
    )
  }

  const formatDate = (date: Date) => {
    const diffInDays = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (diffInDays <= 0) return "Expira hoy"
    if (diffInDays === 1) return "Expira mañana"
    return `Expira en ${diffInDays} días`
  }

  const handleAccept = async () => {
    if (!userState.isAuthenticated || !userState.isCurrentUser) {
      // Redirigir al login con el token para continuar después
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(`/invite/${invitation.token}`)}`
      router.push(loginUrl)
      return
    }

    setIsLoading(true)

    try {
      const result = await acceptInvitationAction({
        token: invitation.token,
        userId: session?.user?.id || ""
      })

      if (result.success) {
        toast.success("¡Invitación aceptada! Bienvenido al workspace.")
        
        // Verificar si necesita onboarding
        if (userState.needsOnboarding) {
          router.push(`/onboarding?workspace=${invitation.workspace.slug}`)
        } else {
          router.push(`/w/${invitation.workspace.slug}`)
        }
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error("Error accepting invitation:", error)
      toast.error("Error al aceptar la invitación")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = () => {
    // Redirigir al login con email pre-poblado (el sistema OTP maneja tanto login como registro)
    const loginUrl = `/login?email=${encodeURIComponent(invitation.email)}&callbackUrl=${encodeURIComponent(`/invite/${invitation.token}`)}`
    router.push(loginUrl)
  }

  const handleLogin = () => {
    // Redirigir al login con callback
    const loginUrl = `/login?callbackUrl=${encodeURIComponent(`/invite/${invitation.token}`)}`
    router.push(loginUrl)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Invitación al workspace
        </CardTitle>
        <CardDescription>
          Has sido invitado a unirte a &ldquo;{invitation.workspace.name}&rdquo;
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Información del workspace */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Workspace:</span>
            <span className="text-sm font-semibold">{invitation.workspace.name}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Tu rol:</span>
            {getRoleBadge(invitation.role)}
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Invitado por:</span>
            <span className="text-sm">{invitation.invitedBy.name || invitation.invitedBy.email}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Válida:</span>
            <span className="text-sm text-amber-600">{formatDate(invitation.expiresAt)}</span>
          </div>
        </div>

        {invitation.workspace.description && (
          <div>
            <p className="text-sm text-gray-600">
              <strong>Acerca del workspace:</strong> {invitation.workspace.description}
            </p>
          </div>
        )}

        {/* Acciones según el estado del usuario */}
        <div className="space-y-3">
          {userState.isAuthenticated && userState.isCurrentUser ? (
            // Usuario autenticado correcto - puede aceptar directamente
            <Button 
              onClick={handleAccept} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aceptando...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Aceptar invitación
                </>
              )}
            </Button>
          ) : userState.hasAccount ? (
            // Usuario tiene cuenta pero no está autenticado
            <div className="space-y-2">
              <p className="text-sm text-gray-600 text-center">
                Ya tienes una cuenta. Inicia sesión para aceptar la invitación.
              </p>
              <Button onClick={handleLogin} className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Iniciar sesión
              </Button>
            </div>
          ) : (
            // Usuario nuevo - necesita crear cuenta
            <div className="space-y-2">
              <p className="text-sm text-gray-600 text-center">
                Para aceptar la invitación, necesitas crear una cuenta.
              </p>
              <Button onClick={handleSignUp} className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Crear cuenta
              </Button>
              <Button onClick={handleLogin} variant="outline" className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Ya tengo cuenta
              </Button>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Al aceptar esta invitación, te unirás al workspace y podrás colaborar con el equipo.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}