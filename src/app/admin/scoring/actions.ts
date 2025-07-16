"use server"

import { auth } from "@/lib/auth"
import { 
  processGrandPrixResults,
  getWorkspaceScoringStatus,
  recalculateGrandPrixScoring
} from "@/services/scoring-service"
import { revalidatePath } from "next/cache"

export async function processGrandPrixAction(
  grandPrixId: string,
  workspaceSeasonId: string
) {
  const session = await auth()
  if (!session?.user?.role || session.user.role !== "superadmin") {
    throw new Error("Acceso no autorizado")
  }
  
  try {
    const results = await processGrandPrixResults(grandPrixId, workspaceSeasonId)
    
    const summary = {
      processedUsers: results.length,
      totalPointsAwarded: results.reduce((sum, r) => sum + r.totalPoints, 0),
      averageCorrect: results.length > 0 
        ? results.reduce((sum, r) => sum + r.correctPredictions, 0) / results.length
        : 0,
    }
    
    revalidatePath("/admin/scoring")
    revalidatePath("/admin")
    revalidatePath("/w")
    
    return summary
  } catch (error) {
    console.error("Error al procesar puntuación:", error)
    throw new Error(error instanceof Error ? error.message : "Error al procesar la puntuación")
  }
}

export async function getScoringStatusAction(workspaceSeasonId: string) {
  const session = await auth()
  if (!session?.user?.role || session.user.role !== "superadmin") {
    throw new Error("Acceso no autorizado")
  }
  
  try {
    return await getWorkspaceScoringStatus(workspaceSeasonId)
  } catch (error) {
    console.error("Error al obtener estado de puntuación:", error)
    throw new Error("Error al obtener el estado de puntuación")
  }
}

export async function recalculateGrandPrixAction(
  grandPrixId: string,
  workspaceSeasonId: string
) {
  const session = await auth()
  if (!session?.user?.role || session.user.role !== "superadmin") {
    throw new Error("Acceso no autorizado")
  }
  
  try {
    const results = await recalculateGrandPrixScoring(grandPrixId, workspaceSeasonId)
    
    revalidatePath("/admin/scoring")
    revalidatePath("/admin")
    revalidatePath("/w")
    
    return {
      success: true,
      processedUsers: results.length,
      totalPointsAwarded: results.reduce((sum, r) => sum + r.totalPoints, 0),
    }
  } catch (error) {
    console.error("Error al recalcular puntuación:", error)
    throw new Error(error instanceof Error ? error.message : "Error al recalcular la puntuación")
  }
}