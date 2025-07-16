"use server"

import { auth } from "@/lib/auth"
import { getUserPerformanceStats, compareUsersInWorkspace } from "@/services/statistics-service"
import { getActiveSeasonForWorkspace } from "@/services/workspace-season-service"
import { getWorkspaceBySlug } from "@/services/workspace-service"

export async function getUserStats(userId: string, workspaceSlug: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("No autorizado")
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug)
  if (!workspace) {
    throw new Error("Workspace no encontrado")
  }

  const activeSeason = await getActiveSeasonForWorkspace(workspace.id)
  if (!activeSeason) {
    throw new Error("No hay temporada activa")
  }

  const stats = await getUserPerformanceStats({
    userId,
    workspaceSeasonId: activeSeason.id,
  })

  return stats
}

export async function compareUsers(userIds: string[], workspaceSlug: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("No autorizado")
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug)
  if (!workspace) {
    throw new Error("Workspace no encontrado")
  }

  const activeSeason = await getActiveSeasonForWorkspace(workspace.id)
  if (!activeSeason) {
    throw new Error("No hay temporada activa")
  }

  const comparison = await compareUsersInWorkspace(userIds, activeSeason.id)

  return comparison
}

export async function getUsersForComparisonAction(workspaceSlug: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("No autorizado")
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug)
  if (!workspace) {
    throw new Error("Workspace no encontrado")
  }

  const activeSeason = await getActiveSeasonForWorkspace(workspace.id)
  if (!activeSeason) {
    throw new Error("No hay temporada activa")
  }

  const { getWorkspaceStandings } = await import("@/services/standings-service")
  const standings = await getWorkspaceStandings(activeSeason.id)
  
  return standings.map(s => ({
    id: s.user.id,
    name: s.user.name || s.user.email.split("@")[0],
    email: s.user.email,
    position: s.position,
    totalPoints: s.totalPoints
  }))
}

export async function exportStandingsToCSV(workspaceSlug: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("No autorizado")
  }

  const workspace = await getWorkspaceBySlug(workspaceSlug)
  if (!workspace) {
    throw new Error("Workspace no encontrado")
  }

  const activeSeason = await getActiveSeasonForWorkspace(workspace.id)
  if (!activeSeason) {
    throw new Error("No hay temporada activa")
  }

  // Obtener standings completos
  const { getWorkspaceStandings } = await import("@/services/standings-service")
  const standings = await getWorkspaceStandings(activeSeason.id)

  // Crear CSV
  const headers = ["Posición", "Competidor", "Predicciones", "Puntos"]
  const rows = standings.map((s) => [
    s.position?.toString() || "",
    s.user.name || s.user.email.split("@")[0],
    s.predictionsCount.toString(),
    s.totalPoints.toString(),
  ])

  const csv = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n")

  return {
    data: csv,
    filename: `clasificacion-${workspace.slug}-${new Date().toISOString().split("T")[0]}.csv`,
  }
}