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
  // Primero obtener el workspaceId desde workspaceSeason
  const workspaceSeason = await prisma.workspaceSeason.findUnique({
    where: { id: workspaceSeasonId },
    select: { workspaceId: true }
  })
  
  if (!workspaceSeason) {
    return []
  }
  
  // Primero obtener los IDs de usuarios que son miembros del workspace
  const workspaceMembers = await prisma.workspaceUser.findMany({
    where: { workspaceId: workspaceSeason.workspaceId },
    select: { userId: true }
  })
  
  const memberUserIds = workspaceMembers.map(wu => wu.userId)
  
  const standings = await prisma.seasonStanding.findMany({
    where: { 
      workspaceSeasonId,
      userId: {
        in: memberUserIds
      }
    },
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
  // Primero obtener el workspaceId desde workspaceSeason
  const workspaceSeason = await prisma.workspaceSeason.findUnique({
    where: { id: workspaceSeasonId },
    select: { workspaceId: true }
  })
  
  if (!workspaceSeason) {
    return []
  }
  
  // Primero obtener los IDs de usuarios que son miembros del workspace
  const workspaceMembers = await prisma.workspaceUser.findMany({
    where: { workspaceId: workspaceSeason.workspaceId },
    select: { userId: true }
  })
  
  const memberUserIds = workspaceMembers.map(wu => wu.userId)
  
  const standings = await prisma.seasonStanding.findMany({
    where: { 
      workspaceSeasonId,
      userId: {
        in: memberUserIds
      }
    },
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
  // Obtener todos los puntos del usuario para este workspace
  const predictionPoints = await prisma.predictionPoints.findMany({
    where: {
      workspaceSeasonId,
      prediction: {
        userId
      }
    }
  })
  
  // Calcular totales
  const totalPoints = predictionPoints.reduce((sum, pp) => sum + pp.points, 0)
  const predictionsCount = predictionPoints.length
  
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
  // Obtener todos los usuarios con puntos en este workspace
  const predictionPoints = await prisma.predictionPoints.findMany({
    where: { workspaceSeasonId },
    include: { 
      prediction: {
        select: { userId: true }
      } 
    }
  })
  
  // Recalcular para cada usuario
  const uniqueUserIds = [...new Set(predictionPoints.map(pp => pp.prediction.userId))]
  await Promise.all(
    uniqueUserIds.map(userId => recalculateUserPoints(workspaceSeasonId, userId))
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
  // Primero obtener el workspaceId desde workspaceSeason
  const workspaceSeason = await prisma.workspaceSeason.findUnique({
    where: { id: workspaceSeasonId },
    select: { workspaceId: true }
  })
  
  if (!workspaceSeason) {
    return {
      totalUsers: 0,
      totalPredictions: 0,
      averagePoints: 0
    }
  }
  
  // Primero obtener los IDs de usuarios que son miembros del workspace
  const workspaceMembers = await prisma.workspaceUser.findMany({
    where: { workspaceId: workspaceSeason.workspaceId },
    select: { userId: true }
  })
  
  const memberUserIds = workspaceMembers.map(wu => wu.userId)
  
  const [totalUsers, totalPredictions, avgPoints] = await Promise.all([
    prisma.seasonStanding.count({
      where: { 
        workspaceSeasonId,
        userId: {
          in: memberUserIds
        }
      }
    }),
    prisma.predictionPoints.count({
      where: { workspaceSeasonId }
    }),
    prisma.seasonStanding.aggregate({
      where: { 
        workspaceSeasonId,
        userId: {
          in: memberUserIds
        }
      },
      _avg: { totalPoints: true }
    })
  ])
  
  return {
    totalUsers,
    totalPredictions,
    averagePoints: Math.round(avgPoints._avg.totalPoints || 0)
  }
}