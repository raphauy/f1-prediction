import { z } from "zod"
import { prisma } from "@/lib/prisma"

// Schemas
export const userStatsFilterSchema = z.object({
  userId: z.string(),
  workspaceSeasonId: z.string(),
  grandPrixId: z.string().optional(),
})

export const gpStatsFilterSchema = z.object({
  grandPrixId: z.string(),
  workspaceSeasonId: z.string(),
})

// Types
export type UserStatsFilter = z.infer<typeof userStatsFilterSchema>
export type GPStatsFilter = z.infer<typeof gpStatsFilterSchema>

export interface UserPerformanceStats {
  userId: string
  totalPoints: number
  totalPredictions: number
  correctPredictions: number
  accuracyRate: number
  pointsByGP: {
    grandPrixId: string
    grandPrixName: string
    round: number
    points: number
    predictions: number
  }[]
  pointsByCategory: {
    category: string
    points: number
    predictions: number
    accuracy: number
  }[]
  recentForm: {
    trend: "up" | "down" | "stable"
    lastFiveGPs: number[]
  }
}

export interface GPDetailedStats {
  grandPrixId: string
  grandPrixName: string
  totalParticipants: number
  totalPredictions: number
  averagePoints: number
  topScorers: {
    userId: string
    userName: string
    points: number
    correctPredictions: number
  }[]
  questionStats: {
    questionText: string
    category: string
    totalAnswers: number
    correctAnswers: number
    accuracyRate: number
    mostCommonAnswer: string
  }[]
}

/**
 * Obtiene estadísticas detalladas de rendimiento de un usuario
 */
export async function getUserPerformanceStats(
  filter: UserStatsFilter
): Promise<UserPerformanceStats | null> {
  const { userId, workspaceSeasonId, grandPrixId } = userStatsFilterSchema.parse(filter)

  // Obtener todas las predicciones con puntos del usuario
  const predictions = await prisma.prediction.findMany({
    where: {
      userId,
      earnedPoints: {
        some: {
          workspaceSeasonId,
        },
      },
      ...(grandPrixId && { grandPrixId }),
    },
    include: {
      earnedPoints: {
        where: { workspaceSeasonId },
      },
      gpQuestion: {
        include: {
          officialResult: true,
        },
      },
      grandPrix: {
        select: {
          id: true,
          name: true,
          round: true,
        },
      },
    },
    orderBy: {
      grandPrix: {
        round: "asc",
      },
    },
  })

  if (predictions.length === 0) {
    return null
  }

  // Calcular estadísticas generales
  const totalPoints = predictions.reduce(
    (sum, p) => sum + (p.earnedPoints[0]?.points || 0),
    0
  )
  const correctPredictions = predictions.filter(
    (p) => p.earnedPoints[0]?.points > 0
  ).length

  // Agrupar puntos por GP
  const pointsByGPMap = new Map<string, {
    grandPrixId: string
    grandPrixName: string
    round: number
    points: number
    predictions: number
  }>()

  predictions.forEach((p) => {
    const gpKey = p.grandPrix.id
    const existing = pointsByGPMap.get(gpKey) || {
      grandPrixId: p.grandPrix.id,
      grandPrixName: p.grandPrix.name,
      round: p.grandPrix.round,
      points: 0,
      predictions: 0,
    }

    existing.points += p.earnedPoints[0]?.points || 0
    existing.predictions += 1
    pointsByGPMap.set(gpKey, existing)
  })

  const pointsByGP = Array.from(pointsByGPMap.values()).sort(
    (a, b) => a.round - b.round
  )

  // Agrupar puntos por categoría
  const pointsByCategoryMap = new Map<string, {
    category: string
    points: number
    predictions: number
    correct: number
  }>()

  predictions.forEach((p) => {
    const category = p.gpQuestion.category || "CLASSIC"
    const existing = pointsByCategoryMap.get(category) || {
      category,
      points: 0,
      predictions: 0,
      correct: 0,
    }

    existing.points += p.earnedPoints[0]?.points || 0
    existing.predictions += 1
    if (p.earnedPoints[0]?.points > 0) {
      existing.correct += 1
    }
    pointsByCategoryMap.set(category, existing)
  })

  const pointsByCategory = Array.from(pointsByCategoryMap.values()).map((cat) => ({
    category: cat.category,
    points: cat.points,
    predictions: cat.predictions,
    accuracy: cat.predictions > 0 ? (cat.correct / cat.predictions) * 100 : 0,
  }))

  // Calcular tendencia reciente (últimos 5 GPs)
  const lastFiveGPs = pointsByGP.slice(-5).map((gp) => gp.points)
  let trend: "up" | "down" | "stable" = "stable"
  
  if (lastFiveGPs.length >= 2) {
    const firstHalf = lastFiveGPs.slice(0, Math.floor(lastFiveGPs.length / 2))
    const secondHalf = lastFiveGPs.slice(Math.floor(lastFiveGPs.length / 2))
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
    
    if (secondAvg > firstAvg * 1.1) trend = "up"
    else if (secondAvg < firstAvg * 0.9) trend = "down"
  }

  return {
    userId,
    totalPoints,
    totalPredictions: predictions.length,
    correctPredictions,
    accuracyRate: predictions.length > 0 
      ? (correctPredictions / predictions.length) * 100 
      : 0,
    pointsByGP,
    pointsByCategory,
    recentForm: {
      trend,
      lastFiveGPs,
    },
  }
}

/**
 * Obtiene estadísticas detalladas de un Gran Premio
 */
export async function getGPDetailedStats(
  filter: GPStatsFilter
): Promise<GPDetailedStats | null> {
  const { grandPrixId, workspaceSeasonId } = gpStatsFilterSchema.parse(filter)

  // Obtener información del GP
  const grandPrix = await prisma.grandPrix.findUnique({
    where: { id: grandPrixId },
    include: {
      predictions: {
        where: {
          earnedPoints: {
            some: {
              workspaceSeasonId,
            },
          },
        },
        include: {
          user: true,
          earnedPoints: {
            where: { workspaceSeasonId },
          },
          gpQuestion: {
            include: {
              officialResult: true,
            },
          },
        },
      },
      gpQuestions: {
        include: {
          officialResult: true,
          predictions: {
            where: {
              earnedPoints: {
                some: {
                  workspaceSeasonId,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!grandPrix) {
    return null
  }

  // Agrupar predicciones por usuario
  const userPointsMap = new Map<string, {
    userId: string
    userName: string
    points: number
    correctPredictions: number
  }>()

  grandPrix.predictions.forEach((p) => {
    const userId = p.user.id
    const existing = userPointsMap.get(userId) || {
      userId,
      userName: p.user.name || p.user.email.split("@")[0],
      points: 0,
      correctPredictions: 0,
    }

    const points = p.earnedPoints[0]?.points || 0
    existing.points += points
    if (points > 0) {
      existing.correctPredictions += 1
    }
    userPointsMap.set(userId, existing)
  })

  const topScorers = Array.from(userPointsMap.values())
    .sort((a, b) => b.points - a.points)
    .slice(0, 10)

  // Estadísticas por pregunta
  const questionStats = grandPrix.gpQuestions.map((q) => {
    const predictions = q.predictions
    const correctAnswers = predictions.filter(
      (p) => p.answer === q.officialResult?.answer
    ).length

    // Contar respuestas más comunes
    const answerCounts = new Map<string, number>()
    predictions.forEach((p) => {
      const count = answerCounts.get(p.answer) || 0
      answerCounts.set(p.answer, count + 1)
    })

    const mostCommonAnswer = Array.from(answerCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"

    return {
      questionText: q.text || "Pregunta",
      category: q.category || "CLASSIC",
      totalAnswers: predictions.length,
      correctAnswers,
      accuracyRate: predictions.length > 0 
        ? (correctAnswers / predictions.length) * 100 
        : 0,
      mostCommonAnswer,
    }
  })

  const totalPoints = Array.from(userPointsMap.values()).reduce(
    (sum, u) => sum + u.points,
    0
  )

  return {
    grandPrixId,
    grandPrixName: grandPrix.name,
    totalParticipants: userPointsMap.size,
    totalPredictions: grandPrix.predictions.length,
    averagePoints: userPointsMap.size > 0 ? totalPoints / userPointsMap.size : 0,
    topScorers,
    questionStats,
  }
}

/**
 * Obtiene evolución de puntos en el tiempo para gráficos
 */
export async function getUserPointsEvolution(
  userId: string,
  workspaceSeasonId: string
): Promise<{ round: number; points: number; cumulativePoints: number }[]> {
  const predictions = await prisma.prediction.findMany({
    where: {
      userId,
      earnedPoints: {
        some: {
          workspaceSeasonId,
        },
      },
    },
    include: {
      earnedPoints: {
        where: { workspaceSeasonId },
      },
      grandPrix: {
        select: {
          round: true,
        },
      },
    },
    orderBy: {
      grandPrix: {
        round: "asc",
      },
    },
  })

  // Agrupar por ronda y calcular acumulados
  const pointsByRound = new Map<number, number>()
  predictions.forEach((p) => {
    const round = p.grandPrix.round
    const points = pointsByRound.get(round) || 0
    pointsByRound.set(round, points + (p.earnedPoints[0]?.points || 0))
  })

  let cumulativePoints = 0
  const evolution = Array.from(pointsByRound.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([round, points]) => {
      cumulativePoints += points
      return {
        round,
        points,
        cumulativePoints,
      }
    })

  return evolution
}

/**
 * Compara múltiples usuarios en un workspace
 */
export async function compareUsersInWorkspace(
  userIds: string[],
  workspaceSeasonId: string
): Promise<{
  users: UserPerformanceStats[]
  comparison: {
    round: number
    grandPrixName: string
    userPoints: { userId: string; points: number }[]
  }[]
}> {
  if (userIds.length < 2 || userIds.length > 4) {
    throw new Error("Se pueden comparar entre 2 y 4 usuarios")
  }

  // Obtener estadísticas de cada usuario
  const users = await Promise.all(
    userIds.map((userId) =>
      getUserPerformanceStats({ userId, workspaceSeasonId })
    )
  )

  // Obtener GPs donde al menos un usuario participó
  const grandPrixIds = new Set<string>()
  users.forEach((user) => {
    if (user) {
      user.pointsByGP.forEach((gp) => grandPrixIds.add(gp.grandPrixId))
    }
  })

  // Crear comparación por GP
  const comparison = Array.from(grandPrixIds).map((gpId) => {
    const gp = users[0]?.pointsByGP.find((g) => g.grandPrixId === gpId)
    return {
      round: gp?.round || 0,
      grandPrixName: gp?.grandPrixName || "",
      userPoints: userIds.map((userId) => {
        const user = users.find((u) => u?.userId === userId)
        const gpData = user?.pointsByGP.find((g) => g.grandPrixId === gpId)
        return {
          userId,
          points: gpData?.points || 0,
        }
      }),
    }
  }).sort((a, b) => a.round - b.round)

  return {
    users: users.filter((u): u is UserPerformanceStats => u !== null),
    comparison,
  }
}