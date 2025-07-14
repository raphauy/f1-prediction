import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ExternalLink } from "lucide-react"
import Link from "next/link"

interface InviteAlreadyAcceptedProps {
  invitation: {
    workspace: {
      name: string
      slug: string
    }
    acceptedAt: Date | null
  }
}

export function InviteAlreadyAccepted({ invitation }: InviteAlreadyAcceptedProps) {
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
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Invitación ya aceptada
        </CardTitle>
        <CardDescription>
          Ya eres miembro del workspace &ldquo;{invitation.workspace.name}&rdquo;
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {invitation.acceptedAt && (
          <div className="bg-green-50 rounded-lg p-4 text-sm">
            <p className="text-green-800">
              <strong>Aceptada el:</strong> {formatDate(invitation.acceptedAt)}
            </p>
          </div>
        )}
        
        <p className="text-sm text-gray-600">
          Esta invitación ya fue aceptada. Puedes acceder al workspace directamente.
        </p>

        <Button asChild className="w-full">
          <Link href={`/w/${invitation.workspace.slug}`}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Ir al workspace
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}