"use server"

import { auth } from "@/lib/auth"
import { 
  getActiveSeasonForWorkspace, 
  getNextGrandPrixForWorkspace,
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
  
  const [nextGP, lastGP, topStandings, userPosition, stats] = await Promise.all([
    getNextGrandPrixForWorkspace(workspace.id),
    getLastGrandPrixWithResults(workspace.id),
    activeSeason ? getTopStandings(activeSeason.id, 5) : Promise.resolve(null),
    activeSeason ? getUserPosition(activeSeason.id, session.user.id) : Promise.resolve(null),
    activeSeason ? getWorkspaceStats(activeSeason.id) : Promise.resolve(null)
  ])

  // Si hay temporada activa, asegurar que el usuario tenga standing
  if (activeSeason) {
    await getOrCreateUserStanding(activeSeason.id, session.user.id)
  }

  // Obtener información de predicciones del usuario para el próximo GP
  let userPredictionInfo = { hasUserPredicted: false, predictionCount: 0, totalQuestions: 0 }
  if (nextGP) {
    const predictions = await getUserPredictionsForGP(session.user.id, nextGP.id)
    const totalQuestions = nextGP._count?.gpQuestions || 0
    userPredictionInfo = {
      hasUserPredicted: predictions.length > 0,
      predictionCount: predictions.length,
      totalQuestions: totalQuestions
    }
  }

  return {
    activeSeason,
    nextGP,
    lastGP,
    topStandings,
    userPosition,
    hasUserPredicted: userPredictionInfo.hasUserPredicted,
    userPredictionInfo,
    stats
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