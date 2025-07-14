import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Home } from "lucide-react"
import Link from "next/link"

export function InviteNotFound() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Invitación no encontrada
        </CardTitle>
        <CardDescription>
          Esta invitación no existe o el enlace es incorrecto
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-gray-600 mb-6">
          Es posible que el enlace haya sido modificado o que la invitación haya sido cancelada.
        </p>
        <Button asChild className="w-full">
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Ir al inicio
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}