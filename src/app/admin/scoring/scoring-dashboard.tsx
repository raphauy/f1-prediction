import { getActiveWorkspaceSeasons } from "@/services/workspace-season-service"
import { ScoringDashboardClient } from "./scoring-dashboard-client"

export async function ScoringDashboard() {
  // Obtener todas las temporadas activas de workspaces
  const workspaceSeasons = await getActiveWorkspaceSeasons()
  
  return <ScoringDashboardClient workspaceSeasons={workspaceSeasons} />
}