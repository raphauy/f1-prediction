import { auth } from "@/lib/auth"
import { getUserWorkspaces } from "@/services/workspace-service"
import { WorkspaceCard } from "./workspace-card"
import { redirect } from "next/navigation"

export async function WorkspaceList() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const userWorkspaces = await getUserWorkspaces(session.user.id)

  if (userWorkspaces.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto max-w-md">
          <h3 className="text-lg font-medium mb-2">
            No estás en ningún juego
          </h3>
          <p className="text-muted-foreground mb-6">
            Ponte en contacto con un administrador para que te invite a un juego
          </p>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              O si eres administrador del sistema, puedes crear juegos desde el panel de administración
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">
              Juegos en los que estoy compitiendo
            </h2>
            <p className="text-sm text-muted-foreground">
              Tienes acceso a {userWorkspaces.length} juego{userWorkspaces.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Grid de workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userWorkspaces.map((userWorkspace) => (
          <WorkspaceCard
            key={userWorkspace.workspace.id}
            workspace={userWorkspace.workspace}
            userRole={userWorkspace.role}
            isSuperadmin={session.user.role === "superadmin"}
          />
        ))}
      </div>
    </div>
  )
}