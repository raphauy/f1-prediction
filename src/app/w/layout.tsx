import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { WorkspaceHeader } from "./workspace-header"
import { SessionProvider } from "next-auth/react"
import { getUserWorkspaces } from "@/services/workspace-service"

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  // All authenticated users can access workspaces (including superadmins)
  
  // Obtener workspaces del usuario para el selector
  const userWorkspaces = await getUserWorkspaces(session.user.id)

  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <WorkspaceHeader 
          user={session.user} 
          userWorkspaces={userWorkspaces}
        />
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}