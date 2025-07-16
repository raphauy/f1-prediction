"use server"

import { auth } from "@/lib/auth"
import { 
  processGrandPrixResults,
  getWorkspaceScoringStatus,
  recalculateGrandPrixScoring
} from "@/services/scoring-service"
import { revalidatePath } from "next/cache"
import { getActiveWorkspaceSeasons } from "@/services/workspace-season-service"
import { prisma } from "@/lib/prisma"
import { logResultsPublished } from "@/services/activity-service"

export async function processGrandPrixAction(
  grandPrixId: string,
  workspaceSeasonId: string
) {
  const session = await auth()
  if (!session?.user?.role || session.user.role !== "superadmin") {
    throw new Error("Acceso no autorizado")
  }
  
  try {
    // Obtener información del workspace y GP
    const [workspaceSeason, grandPrix] = await Promise.all([
      prisma.workspaceSeason.findUnique({
        where: { id: workspaceSeasonId },
        include: { workspace: true, season: true }
      }),
      prisma.grandPrix.findUnique({
        where: { id: grandPrixId },
        select: { name: true, round: true }
      })
    ])
    
    console.log('\n🎯 Procesando puntuación individual')
    console.log(`   Workspace: ${workspaceSeason?.workspace.name || workspaceSeasonId}`)
    console.log(`   Grand Prix: ${grandPrix?.name || grandPrixId} (Ronda ${grandPrix?.round || '?'})`)
    
    const results = await processGrandPrixResults(grandPrixId, workspaceSeasonId)
    
    if (results.length > 0) {
      console.log(`\n📊 Resultados del procesamiento:`)
      console.log(`   Usuarios procesados: ${results.length}`)
      
      // Mostrar detalles de cada usuario
      results
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .forEach((result, index) => {
          console.log(`   ${index + 1}. ${result.userName}: ${result.totalPoints} pts (${result.correctPredictions}/${result.totalPredictions} correctas)`)
        })
      
      // Registrar actividad de resultados publicados
      if (workspaceSeason && grandPrix) {
        await logResultsPublished(
          workspaceSeason.workspace.id,
          session.user.id,
          grandPrix.name
        )
      }
    }
    
    const summary = {
      processedUsers: results.length,
      totalPointsAwarded: results.reduce((sum, r) => sum + r.totalPoints, 0),
      averageCorrect: results.length > 0 
        ? results.reduce((sum, r) => sum + r.correctPredictions, 0) / results.length
        : 0,
    }
    
    console.log(`\n✅ Procesamiento completado`)
    console.log(`   Total puntos otorgados: ${summary.totalPointsAwarded}`)
    console.log(`   Promedio respuestas correctas: ${summary.averageCorrect.toFixed(2)}\n`)
    
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

export async function processAllWorkspacesAction(grandPrixId: string) {
  const session = await auth()
  if (!session?.user?.role || session.user.role !== "superadmin") {
    throw new Error("Acceso no autorizado")
  }
  
  try {
    // Obtener todos los workspace seasons activos
    const workspaceSeasons = await getActiveWorkspaceSeasons()
    
    // Obtener información del Grand Prix
    const grandPrix = await prisma.grandPrix.findUnique({
      where: { id: grandPrixId },
      select: { name: true, round: true, location: true }
    })
    
    console.log('\n🚀 INICIANDO PROCESAMIENTO GLOBAL DE PUNTUACIONES')
    console.log(`📅 Fecha: ${new Date().toLocaleString('es-ES')}`)
    console.log(`🏁 Grand Prix: ${grandPrix?.name || grandPrixId} - ${grandPrix?.location || ''} (Ronda ${grandPrix?.round || '?'})`)
    console.log(`🏆 Total de workspaces a procesar: ${workspaceSeasons.length}`)
    console.log('═'.repeat(50))
    
    const results = []
    let totalProcessedUsers = 0
    let totalPointsAwarded = 0
    let workspacesProcessed = 0
    
    // Procesar cada workspace
    for (const ws of workspaceSeasons) {
      console.log(`\n🏁 Procesando workspace: ${ws.workspace.name}`)
      console.log(`   Temporada: ${ws.season.name}`)
      
      try {
        const result = await processGrandPrixResults(grandPrixId, ws.id)
        if (result.length > 0) {
          totalProcessedUsers += result.length
          totalPointsAwarded += result.reduce((sum, r) => sum + r.totalPoints, 0)
          workspacesProcessed++
          
          console.log(`   ✅ Usuarios procesados: ${result.length}`)
          console.log(`   📊 Resumen de puntos:`)
          
          // Mostrar top 5 usuarios con más puntos
          const topUsers = result
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .slice(0, 5)
          
          topUsers.forEach((userResult, index) => {
            console.log(`      ${index + 1}. ${userResult.userName}: ${userResult.totalPoints} pts (${userResult.correctPredictions}/${userResult.totalPredictions} correctas)`)
          })
          
          if (result.length > 5) {
            console.log(`      ... y ${result.length - 5} usuarios más`)
          }
          
          const totalPoints = result.reduce((sum, r) => sum + r.totalPoints, 0)
          console.log(`   💰 Total puntos otorgados: ${totalPoints}`)
          
          results.push({
            workspaceName: ws.workspace.name,
            processedUsers: result.length,
            totalPoints: totalPoints
          })
        } else {
          console.log(`   ⚠️ No hay usuarios con predicciones en este workspace`)
        }
      } catch (error) {
        console.error(`   ❌ Error procesando workspace ${ws.workspace.name}:`, error)
        // Continuar con el siguiente workspace
      }
    }
    
    revalidatePath("/admin/scoring")
    revalidatePath("/admin")
    revalidatePath("/w")
    
    console.log('\n' + '═'.repeat(50))
    console.log('✅ PROCESAMIENTO COMPLETADO')
    console.log(`📊 Resumen final:`)
    console.log(`   - Workspaces procesados: ${workspacesProcessed}`)
    console.log(`   - Total usuarios: ${totalProcessedUsers}`)
    console.log(`   - Total puntos otorgados: ${totalPointsAwarded}`)
    console.log(`   - Promedio puntos/usuario: ${totalProcessedUsers > 0 ? (totalPointsAwarded / totalProcessedUsers).toFixed(2) : 0}`)
    console.log('═'.repeat(50) + '\n')
    
    return {
      success: true,
      workspacesProcessed,
      totalProcessedUsers,
      totalPointsAwarded,
      details: results
    }
  } catch (error) {
    console.error("Error al procesar todos los workspaces:", error)
    throw new Error(error instanceof Error ? error.message : "Error al procesar todos los workspaces")
  }
}

export async function getGlobalScoringStatusAction() {
  const session = await auth()
  if (!session?.user?.role || session.user.role !== "superadmin") {
    throw new Error("Acceso no autorizado")
  }
  
  try {
    // Obtener todos los workspace seasons activos
    const workspaceSeasons = await getActiveWorkspaceSeasons()
    
    // Para cada workspace, obtener el estado
    const workspaceStatuses = await Promise.all(
      workspaceSeasons.map(async (ws) => {
        const status = await getWorkspaceScoringStatus(ws.id)
        return {
          workspaceId: ws.id,
          workspaceName: ws.workspace.name,
          readyToProcess: status.readyToProcess
        }
      })
    )
    
    // Consolidar GPs únicos listos para procesar
    const uniqueGrandPrix = new Map()
    
    workspaceStatuses.forEach(ws => {
      ws.readyToProcess.forEach(gp => {
        if (!uniqueGrandPrix.has(gp.id)) {
          uniqueGrandPrix.set(gp.id, {
            ...gp,
            workspacesReady: []
          })
        }
        uniqueGrandPrix.get(gp.id).workspacesReady.push({
          id: ws.workspaceId,
          name: ws.workspaceName
        })
      })
    })
    
    return {
      totalWorkspaces: workspaceSeasons.length,
      grandPrixReadyToProcess: Array.from(uniqueGrandPrix.values())
    }
  } catch (error) {
    console.error("Error al obtener estado global de puntuación:", error)
    throw new Error("Error al obtener el estado global de puntuación")
  }
}