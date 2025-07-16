import { z } from "zod"
import { prisma } from "@/lib/prisma"

// Schema para procesar resultados
export const processGrandPrixResultsSchema = z.object({
  grandPrixId: z.string().cuid(),
  workspaceSeasonId: z.string().cuid(),
})

export type ProcessGrandPrixResultsData = z.infer<typeof processGrandPrixResultsSchema>

// Interfaz para el resultado del cálculo
interface ScoringResult {
  userId: string
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
  // Verificar que existan resultados oficiales completos
  const [totalQuestions, officialResultsCount] = await Promise.all([
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
    const scoringResult: ScoringResult = {
      userId,
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
    
    // Actualizar standings del usuario
    await updateUserStandings(userId, workspaceSeasonId, scoringResult.totalPoints)
    
    results.push(scoringResult)
  }
  
  return results
}

/**
 * Actualiza los standings del usuario en el workspace
 */
async function updateUserStandings(
  userId: string,
  workspaceSeasonId: string,
  newPoints: number
): Promise<void> {
  // Obtener standing actual
  const currentStanding = await prisma.seasonStanding.findUnique({
    where: {
      workspaceSeasonId_userId: {
        workspaceSeasonId,
        userId,
      },
    },
  })
  
  if (currentStanding) {
    // Actualizar puntos totales
    await prisma.seasonStanding.update({
      where: { id: currentStanding.id },
      data: {
        totalPoints: currentStanding.totalPoints + newPoints,
        predictionsCount: currentStanding.predictionsCount + 1,
      },
    })
  } else {
    // Crear nuevo standing
    await prisma.seasonStanding.create({
      data: {
        workspaceSeasonId,
        userId,
        totalPoints: newPoints,
        predictionsCount: 1,
      },
    })
  }
  
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