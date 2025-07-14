import { auth } from "@/lib/auth"
import { getWorkspaceBySlug, isUserInWorkspace, isUserWorkspaceAdmin } from "@/services/workspace-service"
import { redirect, notFound } from "next/navigation"
import { WorkspaceNav } from "./workspace-nav"

interface WorkspaceLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const session = await auth()
  const { slug } = await params
  
  if (!session?.user) {
    redirect("/login")
  }

  // Verificar que el workspace existe
  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) {
    notFound()
  }

  // Verificar acceso al workspace (superadmins tienen acceso total)
  if (session.user.role !== "superadmin") {
    const hasAccess = await isUserInWorkspace(session.user.id, workspace.id)
    if (!hasAccess) {
      redirect("/w")
    }
  }

  // Determinar si el usuario es admin del workspace para mostrar opciones de navegación
  const isAdmin = await isUserWorkspaceAdmin(session.user.id, workspace.id)

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {workspace.name}
            </h1>
            {workspace.description && (
              <p className="text-muted-foreground mt-1">
                {workspace.description}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              /{workspace.slug}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <WorkspaceNav workspaceSlug={slug} isAdmin={isAdmin} />

      {/* Content */}
      {children}
    </div>
  )
}