import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { SeasonStanding, User } from "@prisma/client"

// Schema de validación
export const updateStandingSchema = z.object({
  totalPoints: z.number().min(0),
  predictionsCount: z.number().min(0)
})

// Tipos
export type UpdateStandingData = z.infer<typeof updateStandingSchema>

export type StandingWithUser = SeasonStanding & {
  user: User
}

export type StandingWithDetails = SeasonStanding & {
  user: User
  _count: {
    predictions: number
  }
}

/**
 * Obtiene o crea el standing de un usuario en una temporada
 */
export async function getOrCreateUserStanding(
  workspaceSeasonId: string,
  userId: string
): Promise<SeasonStanding> {
  const existing = await prisma.seasonStanding.findUnique({
    where: {
      workspaceSeasonId_userId: {
        workspaceSeasonId,
        userId
      }
    }
  })
  
  if (existing) return existing
  
  return await prisma.seasonStanding.create({
    data: {
      workspaceSeasonId,
      userId
    }
  })
}

/**
 * Obtiene la tabla de posiciones de un workspace
 */
export async function getWorkspaceStandings(workspaceSeasonId: string): Promise<StandingWithUser[]> {
  const standings = await prisma.seasonStanding.findMany({
    where: { workspaceSeasonId },
    include: {
      user: true
    },
    orderBy: [
      { totalPoints: 'desc' },
      { predictionsCount: 'desc' },
      { createdAt: 'asc' } // Desempate por quien se unió primero
    ]
  })
  
  // Asignar posiciones
  return standings.map((standing, index) => ({
    ...standing,
    position: index + 1
  }))
}

/**
 * Obtiene el top N de la tabla
 */
export async function getTopStandings(
  workspaceSeasonId: string, 
  limit: number = 5
): Promise<StandingWithUser[]> {
  const standings = await prisma.seasonStanding.findMany({
    where: { workspaceSeasonId },
    include: {
      user: true
    },
    orderBy: [
      { totalPoints: 'desc' },
      { predictionsCount: 'desc' }
    ],
    take: limit
  })
  
  return standings.map((standing, index) => ({
    ...standing,
    position: index + 1
  }))
}

/**
 * Actualiza los puntos de un usuario
 */
export async function updateUserStanding(
  workspaceSeasonId: string,
  userId: string,
  data: UpdateStandingData
): Promise<SeasonStanding> {
  const validated = updateStandingSchema.parse(data)
  
  return await prisma.seasonStanding.update({
    where: {
      workspaceSeasonId_userId: {
        workspaceSeasonId,
        userId
      }
    },
    data: validated
  })
}

/**
 * Recalcula los puntos de un usuario basándose en sus predicciones
 */
export async function recalculateUserPoints(
  workspaceSeasonId: string,
  userId: string
): Promise<SeasonStanding> {
  // Obtener todas las predicciones con puntos
  const predictions = await prisma.prediction.findMany({
    where: {
      workspaceSeasonId,
      userId,
      earnedPoints: {
        not: null
      }
    }
  })
  
  // Calcular totales
  const totalPoints = predictions.reduce((sum, pred) => sum + (pred.earnedPoints || 0), 0)
  const predictionsCount = predictions.length
  
  // Actualizar standing
  return await prisma.seasonStanding.upsert({
    where: {
      workspaceSeasonId_userId: {
        workspaceSeasonId,
        userId
      }
    },
    update: {
      totalPoints,
      predictionsCount
    },
    create: {
      workspaceSeasonId,
      userId,
      totalPoints,
      predictionsCount
    }
  })
}

/**
 * Recalcula los puntos de todos los usuarios de un workspace
 */
export async function recalculateAllStandings(workspaceSeasonId: string): Promise<void> {
  // Obtener todos los usuarios con predicciones
  const users = await prisma.prediction.findMany({
    where: { workspaceSeasonId },
    select: { userId: true },
    distinct: ['userId']
  })
  
  // Recalcular para cada usuario
  await Promise.all(
    users.map(user => recalculateUserPoints(workspaceSeasonId, user.userId))
  )
}

/**
 * Obtiene la posición de un usuario en la tabla
 */
export async function getUserPosition(
  workspaceSeasonId: string,
  userId: string
): Promise<number | null> {
  const standings = await getWorkspaceStandings(workspaceSeasonId)
  const userStanding = standings.find(s => s.userId === userId)
  
  return userStanding?.position || null
}

/**
 * Obtiene estadísticas del workspace
 */
export async function getWorkspaceStats(workspaceSeasonId: string) {
  const [totalUsers, totalPredictions, avgPoints] = await Promise.all([
    prisma.seasonStanding.count({
      where: { workspaceSeasonId }
    }),
    prisma.prediction.count({
      where: { workspaceSeasonId }
    }),
    prisma.seasonStanding.aggregate({
      where: { workspaceSeasonId },
      _avg: { totalPoints: true }
    })
  ])
  
  return {
    totalUsers,
    totalPredictions,
    averagePoints: Math.round(avgPoints._avg.totalPoints || 0)
  }
}