import { Suspense } from "react"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { getWorkspaceBySlug, isUserInWorkspace } from "@/services/workspace-service"
import { StandingsTable } from "./standings-table"
import { StandingsSkeleton } from "./standings-skeleton"

interface StandingsPageProps {
  params: Promise<{ slug: string }>
}

export default async function StandingsPage({ params }: StandingsPageProps) {
  const { slug } = await params
  const session = await auth()
  const workspace = await getWorkspaceBySlug(slug)
  
  if (!workspace || !session?.user) {
    notFound()
  }

  // Verificar que el usuario pertenece al workspace
  const isUserMember = await isUserInWorkspace(session.user.id, workspace.id)
  if (!isUserMember) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clasificación</h1>
        <p className="text-muted-foreground mt-2">
          Tabla de posiciones de la temporada actual
        </p>
      </div>

      <Suspense fallback={<StandingsSkeleton />}>
        <StandingsTable 
          workspaceId={workspace.id} 
          currentUserId={session.user.id}
          workspaceSlug={slug}
        />
      </Suspense>
    </div>
  )
}