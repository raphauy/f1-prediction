import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UserSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Administra tus preferencias generales
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>
            Esta funcionalidad estará disponible próximamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Aquí podrás configurar tus preferencias, notificaciones y otros ajustes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}