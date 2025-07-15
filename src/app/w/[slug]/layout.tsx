import { auth } from "@/lib/auth"
import { getWorkspaceBySlug, isUserInWorkspace, isUserWorkspaceAdmin, getUserWorkspaces } from "@/services/workspace-service"
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
  
  // Obtener workspaces del usuario para el selector
  const userWorkspaces = await getUserWorkspaces(session.user.id)

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <WorkspaceNav 
        workspaceSlug={slug} 
        isAdmin={isAdmin} 
        user={session.user}
        userWorkspaces={userWorkspaces}
        currentWorkspace={workspace}
      />

      {/* Content */}
      {children}
    </div>
  )
}