import { getWorkspaceStandings } from "@/services/standings-service"
import { getActiveSeasonForWorkspace } from "@/services/workspace-season-service"
import { getWorkspaceBySlug } from "@/services/workspace-service"
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StandingsWrapper } from "./standings-wrapper"

interface StandingsTableProps {
  workspaceId: string
  currentUserId: string
  workspaceSlug?: string
}

export async function StandingsTable({ workspaceId, currentUserId, workspaceSlug }: StandingsTableProps) {
  // Obtener la temporada activa del workspace
  const activeSeason = await getActiveSeasonForWorkspace(workspaceId)
  
  if (!activeSeason) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No hay una temporada activa en este workspace. La clasificación estará disponible cuando comience la temporada.
        </AlertDescription>
      </Alert>
    )
  }

  const standings = await getWorkspaceStandings(activeSeason.id)

  if (!standings || standings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No hay datos de clasificación disponibles aún.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Las posiciones se actualizarán después del primer Gran Premio.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Encontrar posiciones previas (simulado por ahora)
  const standingsWithTrend = standings.map((standing) => ({
    ...standing,
    previousPosition: standing.position, // Por ahora mismo valor
    trend: 0 // 0 = sin cambio, positivo = subió, negativo = bajó
  }))

  // Obtener el workspace para tener el slug
  const workspace = workspaceSlug ? { slug: workspaceSlug } : await getWorkspaceBySlug(workspaceId)
  const slug = workspace?.slug || workspaceSlug || ""

  return (
    <StandingsWrapper
      standings={standingsWithTrend}
      currentUserId={currentUserId}
      workspaceSlug={slug}
      workspaceSeasonId={activeSeason.id}
    />
  )
}