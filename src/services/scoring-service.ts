import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { logPointsEarned } from "@/services/activity-service"

// Schema para procesar resultados
export const processGrandPrixResultsSchema = z.object({
  grandPrixId: z.string().cuid(),
  workspaceSeasonId: z.string().cuid(),
})

export type ProcessGrandPrixResultsData = z.infer<typeof processGrandPrixResultsSchema>

// Interfaz para el resultado del cálculo
interface ScoringResult {
  userId: string
  userName: string
  totalPoints: number
  correctPredictions: number
  totalPredictions: number
  details: {
    questionId: string
    questionText: string
    prediction: string
    officialAnswer: string
    correct: boolean
    points: number
  }[]
}

/**
 * Procesa los resultados de un Grand Prix y calcula puntos para todas las predicciones
 */
export async function processGrandPrixResults(
  grandPrixId: string,
  workspaceSeasonId: string
): Promise<ScoringResult[]> {
  // Obtener información del GP y workspace
  const [grandPrix, workspaceSeason, totalQuestions, officialResultsCount] = await Promise.all([
    prisma.grandPrix.findUnique({ where: { id: grandPrixId } }),
    prisma.workspaceSeason.findUnique({ 
      where: { id: workspaceSeasonId },
      include: { workspace: true }
    }),
    prisma.gPQuestion.count({ where: { grandPrixId } }),
    prisma.officialResult.count({ where: { grandPrixId } }),
  ])
  
  if (totalQuestions !== officialResultsCount) {
    throw new Error(
      `Faltan resultados oficiales: ${officialResultsCount}/${totalQuestions} completados`
    )
  }
  
  // Obtener todas las predicciones del GP con sus resultados oficiales
  const predictions = await prisma.prediction.findMany({
    where: { grandPrixId },
    include: {
      user: true,
      gpQuestion: {
        include: {
          question: true,
          template: true,
          officialResult: true,
        },
      },
    },
  })
  
  // Agrupar predicciones por usuario
  const predictionsByUser = new Map<string, typeof predictions>()
  
  for (const prediction of predictions) {
    const userPredictions = predictionsByUser.get(prediction.userId) || []
    userPredictions.push(prediction)
    predictionsByUser.set(prediction.userId, userPredictions)
  }
  
  // Calcular puntos para cada usuario
  const results: ScoringResult[] = []
  
  for (const [userId, userPredictions] of predictionsByUser) {
    // Obtener el nombre del usuario de la primera predicción
    const userName = userPredictions[0]?.user?.name || 'Usuario sin nombre'
    
    const scoringResult: ScoringResult = {
      userId,
      userName,
      totalPoints: 0,
      correctPredictions: 0,
      totalPredictions: userPredictions.length,
      details: [],
    }
    
    // Procesar cada predicción del usuario
    for (const prediction of userPredictions) {
      const gpQuestion = prediction.gpQuestion
      const questionText = gpQuestion.text || gpQuestion.question?.text || gpQuestion.template?.text || ""
      const officialAnswer = gpQuestion.officialResult?.answer || ""
      const points = gpQuestion.points
      
      // Comparar predicción con resultado oficial
      const isCorrect = prediction.answer === officialAnswer
      
      if (isCorrect) {
        scoringResult.correctPredictions++
        scoringResult.totalPoints += points
        
        // Crear o actualizar registro de puntos
        await prisma.predictionPoints.upsert({
          where: {
            predictionId_workspaceSeasonId: {
              predictionId: prediction.id,
              workspaceSeasonId,
            },
          },
          update: {
            points,
          },
          create: {
            predictionId: prediction.id,
            workspaceSeasonId,
            points,
          },
        })
      } else {
        // Si la respuesta es incorrecta, asegurarse de que los puntos sean 0
        await prisma.predictionPoints.upsert({
          where: {
            predictionId_workspaceSeasonId: {
              predictionId: prediction.id,
              workspaceSeasonId,
            },
          },
          update: {
            points: 0,
          },
          create: {
            predictionId: prediction.id,
            workspaceSeasonId,
            points: 0,
          },
        })
      }
      
      scoringResult.details.push({
        questionId: gpQuestion.id,
        questionText,
        prediction: prediction.answer,
        officialAnswer,
        correct: isCorrect,
        points: isCorrect ? points : 0,
      })
    }
    
    // Actualizar standings del usuario (recalcula totales)
    await updateUserStandings(userId, workspaceSeasonId)
    
    // Registrar actividad si el usuario ganó puntos
    // Solo registrar si es la primera vez que se procesan los resultados
    if (scoringResult.totalPoints > 0 && grandPrix && workspaceSeason) {
      // Verificar si ya existe una actividad de puntos para este usuario y GP
      const existingActivity = await prisma.activityLog.findFirst({
        where: {
          workspaceId: workspaceSeason.workspace.id,
          userId,
          type: 'points_earned',
          metadata: {
            path: ['grandPrixName'],
            equals: grandPrix.name
          }
        }
      })
      
      if (!existingActivity) {
        await logPointsEarned(
          workspaceSeason.workspace.id,
          userId,
          grandPrix.name,
          scoringResult.totalPoints
        )
      }
    }
    
    results.push(scoringResult)
  }
  
  return results
}

/**
 * Actualiza los standings del usuario en el workspace
 * Esta función recalcula completamente los puntos y el contador de GPs
 */
async function updateUserStandings(
  userId: string,
  workspaceSeasonId: string
): Promise<void> {
  // Calcular puntos totales y número de GPs únicos
  const userPoints = await prisma.predictionPoints.findMany({
    where: {
      workspaceSeasonId,
      prediction: { userId }
    },
    include: {
      prediction: {
        include: {
          grandPrix: true
        }
      }
    }
  })
  
  // Calcular puntos totales
  const totalPoints = userPoints.reduce((sum, pp) => sum + pp.points, 0)
  
  // Contar GPs únicos (no el número de predicciones)
  const uniqueGPs = new Set(userPoints.map(pp => pp.prediction.grandPrixId))
  const gpCount = uniqueGPs.size
  
  // Actualizar o crear standing
  await prisma.seasonStanding.upsert({
    where: {
      workspaceSeasonId_userId: {
        workspaceSeasonId,
        userId,
      },
    },
    update: {
      totalPoints,
      predictionsCount: gpCount,
    },
    create: {
      workspaceSeasonId,
      userId,
      totalPoints,
      predictionsCount: gpCount,
    },
  })
  
  // Actualizar posiciones de todos los usuarios en el workspace
  await updateStandingPositions(workspaceSeasonId)
}

/**
 * Actualiza las posiciones en la tabla de standings
 */
async function updateStandingPositions(workspaceSeasonId: string): Promise<void> {
  const standings = await prisma.seasonStanding.findMany({
    where: { workspaceSeasonId },
    orderBy: [
      { totalPoints: 'desc' },
      { predictionsCount: 'desc' },
    ],
  })
  
  // Actualizar posiciones
  for (let i = 0; i < standings.length; i++) {
    await prisma.seasonStanding.update({
      where: { id: standings[i].id },
      data: { position: i + 1 },
    })
  }
}

/**
 * Recalcula los puntos para un Grand Prix específico
 */
export async function recalculateGrandPrixScoring(
  grandPrixId: string,
  workspaceSeasonId: string
): Promise<ScoringResult[]> {
  // Eliminar puntos existentes para este GP y workspace
  const predictions = await prisma.prediction.findMany({
    where: { grandPrixId },
    select: { id: true },
  })
  
  await prisma.predictionPoints.deleteMany({
    where: {
      predictionId: { in: predictions.map(p => p.id) },
      workspaceSeasonId,
    },
  })
  
  // Recalcular standings (restando los puntos anteriores)
  const standings = await prisma.seasonStanding.findMany({
    where: { workspaceSeasonId },
  })
  
  for (const standing of standings) {
    const previousPoints = await prisma.predictionPoints.aggregate({
      where: {
        workspaceSeasonId,
        prediction: {
          userId: standing.userId,
        },
      },
      _sum: {
        points: true,
      },
    })
    
    await prisma.seasonStanding.update({
      where: { id: standing.id },
      data: {
        totalPoints: previousPoints._sum.points || 0,
      },
    })
  }
  
  // Recalcular puntos
  return await processGrandPrixResults(grandPrixId, workspaceSeasonId)
}

/**
 * Obtiene el resumen de puntuación para un workspace
 */
export async function getWorkspaceScoringStatus(workspaceSeasonId: string) {
  const workspaceSeason = await prisma.workspaceSeason.findUnique({
    where: { id: workspaceSeasonId },
    include: {
      season: {
        include: {
          grandPrix: {
            include: {
              _count: {
                select: {
                  predictions: true,
                  officialResults: true,
                  gpQuestions: true,
                },
              },
            },
          },
        },
      },
    },
  })
  
  if (!workspaceSeason) {
    throw new Error("WorkspaceSeason no encontrado")
  }
  
  const grandPrixStatus = workspaceSeason.season.grandPrix.map(gp => ({
    id: gp.id,
    name: gp.name,
    round: gp.round,
    hasPredictions: gp._count.predictions > 0,
    hasCompleteResults: gp._count.officialResults === gp._count.gpQuestions,
    totalQuestions: gp._count.gpQuestions,
    totalResults: gp._count.officialResults,
  }))
  
  return {
    workspaceSeasonId,
    seasonName: workspaceSeason.season.name,
    grandPrixStatus,
    readyToProcess: grandPrixStatus.filter(
      gp => gp.hasPredictions && gp.hasCompleteResults
    ),
  }
}