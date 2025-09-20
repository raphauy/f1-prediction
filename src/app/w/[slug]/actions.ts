"use server"

import { auth } from "@/lib/auth"
import { 
  getActiveSeasonForWorkspace, 
  getNextGrandPrixForWorkspace,
  getNextGrandPrix,
  getLastGrandPrixWithResults 
} from "@/services/workspace-season-service"
import {
  getUserPredictionsForGP
} from "@/services/prediction-service"
import {
  getWorkspaceStandings,
  getTopStandings,
  getUserPosition,
  getOrCreateUserStanding,
  getWorkspaceStats
} from "@/services/standings-service"
import { getWorkspaceBySlug } from "@/services/workspace-service"
import { getGlobalStandings } from "@/services/global-standings-service"
import { getDashboardActivities } from "@/services/activity-service"
import { prisma } from "@/lib/prisma"

/**
 * Obtiene la información del dashboard F1 para un workspace
 */
export async function getDashboardData(slug: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("No autorizado")
  }

  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) {
    throw new Error("Workspace no encontrado")
  }

  const activeSeason = await getActiveSeasonForWorkspace(workspace.id)
  
  // Obtener el próximo GP para mostrar (sin importar estado) y el GP activo para predicciones
  const [nextGPDisplay, nextGPActive, lastGP, topStandings, userPosition, stats, globalStandings, recentActivities] = await Promise.all([
    getNextGrandPrix(workspace.id), // GP para mostrar (cualquier estado)
    getNextGrandPrixForWorkspace(workspace.id), // GP activo para predicciones
    getLastGrandPrixWithResults(workspace.id),
    activeSeason ? getTopStandings(activeSeason.id, 5) : Promise.resolve(null),
    activeSeason ? getUserPosition(activeSeason.id, session.user.id) : Promise.resolve(null),
    activeSeason ? getWorkspaceStats(activeSeason.id) : Promise.resolve(null),
    getGlobalStandings({ limit: 5 }),
    getDashboardActivities(workspace.id)
  ])

  // Si hay temporada activa y el usuario es miembro del workspace, asegurar que tenga standing
  if (activeSeason) {
    // Verificar si el usuario es miembro del workspace (no solo superadmin)
    const isMember = await prisma.workspaceUser.findFirst({
      where: {
        userId: session.user.id,
        workspaceId: workspace.id
      }
    })
    
    if (isMember) {
      await getOrCreateUserStanding(activeSeason.id, session.user.id)
    }
  }

  // Obtener información de predicciones del usuario
  let userPredictionInfo = { hasUserPredicted: false, predictionCount: 0, totalQuestions: 0 }
  // Si hay un GP para mostrar, obtener la info de predicciones (sin importar si es el activo o no)
  if (nextGPDisplay) {
    const predictions = await getUserPredictionsForGP(session.user.id, nextGPDisplay.id)
    const totalQuestions = nextGPDisplay._count?.gpQuestions || 0
    userPredictionInfo = {
      hasUserPredicted: predictions.length > 0,
      predictionCount: predictions.length,
      totalQuestions: totalQuestions
    }
  }

  // Determinar si el GP que se muestra está activo
  const isGPActive = nextGPActive && nextGPDisplay && nextGPActive.id === nextGPDisplay.id
  
  return {
    activeSeason,
    nextGP: nextGPDisplay, // GP para mostrar en el card
    nextGPActive, // GP activo para predicciones
    isGPActive, // Si el GP mostrado es el activo
    lastGP,
    topStandings,
    globalStandings: globalStandings.standings,
    userPosition,
    hasUserPredicted: userPredictionInfo.hasUserPredicted,
    userPredictionInfo,
    stats,
    recentActivities
  }
}

/**
 * Obtiene las predicciones del usuario para un GP
 */
export async function getUserPredictions(slug: string, grandPrixId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("No autorizado")
  }

  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) {
    throw new Error("Workspace no encontrado")
  }

  const activeSeason = await getActiveSeasonForWorkspace(workspace.id)
  if (!activeSeason) {
    throw new Error("No hay temporada activa")
  }

  return await getUserPredictionsForGP(
    session.user.id,
    grandPrixId
  )
}

// Función removida: submitPredictions ya no es necesaria
// Las predicciones ahora se manejan individualmente desde la página de predicciones

/**
 * Obtiene la tabla completa de clasificación
 */
export async function getFullStandings(slug: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("No autorizado")
  }

  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) {
    throw new Error("Workspace no encontrado")
  }

  const activeSeason = await getActiveSeasonForWorkspace(workspace.id)
  if (!activeSeason) {
    return []
  }

  return await getWorkspaceStandings(activeSeason.id)
}