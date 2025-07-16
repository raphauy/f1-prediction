import { auth } from "@/lib/auth"
import { getWorkspaceBySlug, isUserInWorkspace } from "@/services/workspace-service"
import { getDashboardData } from "./actions"
import { NextGPCard } from "./next-gp-card"
import { StandingsPreview } from "./standings-preview"
import { UserStatusCard } from "./user-status-card"
import { WorkspaceStatsCard } from "./workspace-stats-card"
import { RecentActivity } from "./recent-activity"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
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

  // Verificar que el usuario pertenece al workspace
  const isUserMember = await isUserInWorkspace(session.user.id, workspace.id)
  if (!isUserMember) {
    notFound()
  }

  // Obtener datos del dashboard F1
  const dashboardData = await getDashboardData(slug)
  const { 
    activeSeason, 
    nextGP, 
    lastGP, 
    topStandings, 
    userPosition, 
    hasUserPredicted,
    userPredictionInfo,
    stats 
  } = dashboardData

  // Obtener el standing del usuario actual si existe
  const userStanding = topStandings?.find(s => s.userId === session.user.id)

  return (
    <div className="space-y-6">
      {!activeSeason && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No hay temporada activa. El juego comenzará cuando se active la temporada 2025.
          </AlertDescription>
        </Alert>
      )}

      {/* Próximo GP */}
      <NextGPCard 
        grandPrix={nextGP} 
        hasUserPredicted={hasUserPredicted}
        userPredictionInfo={userPredictionInfo}
        workspaceSlug={slug}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UserStatusCard 
          userPosition={userPosition}
          userPoints={userStanding?.totalPoints}
          totalCompetitors={stats?.totalUsers}
        />
        <WorkspaceStatsCard stats={stats} />
        {activeSeason && (
          <div className="md:col-span-1">
            <StandingsPreview 
              standings={topStandings?.slice(0, 3) || null}
              currentUserId={session.user.id}
              workspaceSlug={slug}
            />
          </div>
        )}
      </div>

      {/* Clasificación y Actividad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeSeason && topStandings && topStandings.length > 3 && (
          <StandingsPreview 
            standings={topStandings}
            currentUserId={session.user.id}
            workspaceSlug={slug}
          />
        )}
        <RecentActivity lastGP={lastGP} />
      </div>
    </div>
  )
}