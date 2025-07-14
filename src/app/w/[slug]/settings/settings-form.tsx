import { auth } from "@/lib/auth"
import { getWorkspaceBySlug, isUserWorkspaceAdmin } from "@/services/workspace-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Settings, AlertTriangle } from "lucide-react"
import { notFound, redirect } from "next/navigation"

interface SettingsFormProps {
  slug: string
}

export async function SettingsForm({ slug }: SettingsFormProps) {
  const session = await auth()
  const workspace = await getWorkspaceBySlug(slug)
  
  if (!workspace || !session?.user) {
    notFound()
  }

  const isAdmin = await isUserWorkspaceAdmin(session.user.id, workspace.id)

  if (!isAdmin) {
    redirect(`/w/${slug}`)
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configuración General</span>
          </CardTitle>
          <CardDescription>
            Información básica del workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input 
                id="name" 
                defaultValue={workspace.name}
                placeholder="Nombre del workspace"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input 
                id="slug" 
                defaultValue={workspace.slug}
                placeholder="workspace-slug"
                readOnly
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">
                El slug no se puede cambiar después de la creación
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea 
              id="description" 
              defaultValue={workspace.description || ""}
              placeholder="Descripción del workspace (opcional)"
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button>
              Guardar Cambios
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>Zona de Peligro</span>
          </CardTitle>
          <CardDescription>
            Acciones irreversibles para este workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <h4 className="font-medium text-red-900 mb-2">
              Eliminar Workspace
            </h4>
            <p className="text-sm text-red-700 mb-4">
              Esta acción eliminará permanentemente el workspace y todos sus datos. 
              Esta acción no se puede deshacer.
            </p>
            <Button variant="destructive" size="sm">
              Eliminar Workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}