import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Home, Mail } from "lucide-react"
import Link from "next/link"

interface InviteExpiredProps {
  invitation: {
    workspace: {
      name: string
    }
    invitedBy: {
      name: string | null
      email: string
    }
    expiresAt: Date
  }
}

export function InviteExpired({ invitation }: InviteExpiredProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <Clock className="h-6 w-6 text-amber-600" />
        </div>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Invitación expirada
        </CardTitle>
        <CardDescription>
          Esta invitación a &ldquo;{invitation.workspace.name}&rdquo; ha expirado
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 text-sm">
          <p className="text-gray-600">
            <strong>Invitado por:</strong> {invitation.invitedBy.name || invitation.invitedBy.email}
          </p>
          <p className="text-gray-600 mt-1">
            <strong>Expiró el:</strong> {formatDate(invitation.expiresAt)}
          </p>
        </div>
        
        <p className="text-sm text-gray-600">
          Las invitaciones expiran por seguridad. Solicita una nueva invitación al administrador del workspace.
        </p>

        <div className="flex flex-col gap-2">
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Ir al inicio
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href={`mailto:${invitation.invitedBy.email}?subject=Solicitud de nueva invitación&body=Hola, mi invitación al workspace "${invitation.workspace.name}" ha expirado. ¿Podrías enviarme una nueva invitación?`}>
              <Mail className="h-4 w-4 mr-2" />
              Contactar {invitation.invitedBy.name || "invitador"}
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}