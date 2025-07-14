import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Users, Building2, Mail, UserCheck, Shield, Plus } from "lucide-react"
import Link from "next/link"
import { getAdminDashboardMetrics } from "@/services/dashboard-service"

export default async function AdminDashboard() {
  const session = await auth()
  const metrics = await getAdminDashboardMetrics()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Panel de Administración</h2>
          <p className="text-muted-foreground">
            Resumen de tu aplicación
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/w">
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Todos los Workspaces
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Usuarios
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuarios registrados en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Workspaces
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalWorkspaces}</div>
            <p className="text-xs text-muted-foreground">
              Workspaces creados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Invitaciones Pendientes
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingInvitations}</div>
            <p className="text-xs text-muted-foreground">
              Invitaciones sin aceptar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuarios Activos
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Han completado onboarding
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Información de Sesión</span>
            </CardTitle>
            <CardDescription>
              Detalles de la sesión actual del usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Email:</span>
                <span className="text-sm">{session?.user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Rol:</span>
                <span className="text-sm capitalize">{session?.user?.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">ID de Usuario:</span>
                <span className="text-sm font-mono text-xs">{session?.user?.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Acciones Rápidas</span>
            </CardTitle>
            <CardDescription>
              Acceso directo a funciones principales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/users/new">
                  <Users className="h-4 w-4 mr-2" />
                  Crear Usuario
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/workspaces/new">
                  <Building2 className="h-4 w-4 mr-2" />
                  Crear Workspace
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  Gestionar Usuarios
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/admin/workspaces">
                  <Building2 className="h-4 w-4 mr-2" />
                  Gestionar Workspaces
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}