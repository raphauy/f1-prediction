"use server"

import { auth } from "@/lib/auth"
import { 
  getActiveSeasonForWorkspace, 
  getNextGrandPrixForWorkspace,
  getLastGrandPrixWithResults 
} from "@/services/workspace-season-service"
import {
  getUserPredictionsForGP,
  hasUserPredictedForGP,
  createMultiplePredictions
} from "@/services/prediction-service"
import {
  getWorkspaceStandings,
  getTopStandings,
  getUserPosition,
  getOrCreateUserStanding,
  getWorkspaceStats
} from "@/services/standings-service"
import { getWorkspaceBySlug } from "@/services/workspace-service"
import { revalidatePath } from "next/cache"

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

  // Verificar si el usuario ya predijo para el próximo GP
  let hasUserPredicted = false
  if (nextGP && activeSeason) {
    hasUserPredicted = await hasUserPredictedForGP(
      session.user.id,
      nextGP.id,
      activeSeason.id
    )
  }

  return {
    activeSeason,
    nextGP,
    lastGP,
    topStandings,
    userPosition,
    hasUserPredicted,
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
    grandPrixId,
    activeSeason.id
  )
}

/**
 * Envía las predicciones del usuario
 */
export async function submitPredictions(
  slug: string,
  grandPrixId: string,
  predictions: Array<{ gpQuestionId: string; answer: string }>
) {
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

  // Verificar si ya predijo
  const alreadyPredicted = await hasUserPredictedForGP(
    session.user.id,
    grandPrixId,
    activeSeason.id
  )

  if (alreadyPredicted) {
    throw new Error("Ya realizaste predicciones para este GP")
  }

  // Crear predicciones
  await createMultiplePredictions({
    workspaceSeasonId: activeSeason.id,
    userId: session.user.id,
    grandPrixId,
    predictions
  })

  // Revalidar páginas
  revalidatePath(`/w/${slug}`)
  revalidatePath(`/w/${slug}/predictions`)
  
  return { success: true }
}

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