import { auth } from "@/lib/auth"
import { getWorkspaceBySlug, getWorkspaceUsers } from "@/services/workspace-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, Shield, Calendar } from "lucide-react"
import { notFound } from "next/navigation"

interface WorkspaceDashboardProps {
  slug: string
}

export async function WorkspaceDashboard({ slug }: WorkspaceDashboardProps) {
  const session = await auth()
  const workspace = await getWorkspaceBySlug(slug)
  
  if (!workspace || !session?.user) {
    notFound()
  }

  const workspaceUsers = await getWorkspaceUsers(workspace.id)
  const totalUsers = workspaceUsers.length
  const adminUsers = workspaceUsers.filter(wu => wu.role === "admin").length

  const currentUserWorkspace = workspaceUsers.find(wu => wu.userId === session.user.id)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Miembros
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              miembros en el workspace
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administradores
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminUsers}</div>
            <p className="text-xs text-muted-foreground">
              con permisos de administración
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tu Rol
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentUserWorkspace?.role === "admin" ? (
                <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                  Admin
                </Badge>
              ) : (
                <Badge variant="secondary">
                  Miembro
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              en este workspace
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Actividad Reciente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p>No hay actividad reciente</p>
              <p className="text-sm">
                La actividad del workspace aparecerá aquí cuando haya actualizaciones
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Gestión de Miembros</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Administra los usuarios del workspace
              </p>
              <a 
                href={`/w/${slug}/members`}
                className="text-primary hover:text-primary/80 text-sm font-medium"
              >
                Ver miembros →
              </a>
            </div>
            {currentUserWorkspace?.role === "admin" && (
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Configuración</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Ajusta la configuración del workspace
                </p>
                <a 
                  href={`/w/${slug}/settings`}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Configurar →
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}