import { prisma } from "@/lib/prisma"
import { ActivityType, Prisma } from "@prisma/client"

interface CreateActivityData {
  workspaceId: string
  userId: string
  type: ActivityType
  description: string
  metadata?: Prisma.InputJsonValue
}

/**
 * Registra una nueva actividad en el workspace
 */
export async function createActivity(data: CreateActivityData) {
  return await prisma.activityLog.create({
    data: {
      workspaceId: data.workspaceId,
      userId: data.userId,
      type: data.type,
      description: data.description,
      metadata: data.metadata !== undefined ? data.metadata : Prisma.JsonNull
    }
  })
}

/**
 * Obtiene las actividades recientes de un workspace
 */
export async function getRecentActivities(workspaceId: string, limit: number = 10) {
  const activities = await prisma.activityLog.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return activities
}

/**
 * Registra cuando un usuario hace predicciones por primera vez
 */
export async function logPredictionSubmitted(
  workspaceId: string,
  userId: string,
  grandPrixName: string,
  predictionCount: number
) {
  // Verificar si ya existe una actividad de predicciones para este GP y usuario
  const existingActivity = await prisma.activityLog.findFirst({
    where: {
      workspaceId,
      userId,
      type: ActivityType.prediction_submitted,
      metadata: {
        path: ['grandPrixName'],
        equals: grandPrixName
      }
    }
  })

  // Solo crear la actividad si no existe una previa (primera vez que completa)
  if (!existingActivity) {
    await createActivity({
      workspaceId,
      userId,
      type: ActivityType.prediction_submitted,
      description: `realizó ${predictionCount} predicciones para el ${grandPrixName}`,
      metadata: { grandPrixName, predictionCount }
    })
  }
}

/**
 * Registra cuando un usuario gana puntos
 */
export async function logPointsEarned(
  workspaceId: string,
  userId: string,
  grandPrixName: string,
  points: number
) {
  await createActivity({
    workspaceId,
    userId,
    type: ActivityType.points_earned,
    description: `ganó ${points} puntos en el ${grandPrixName}`,
    metadata: { grandPrixName, points }
  })
}

/**
 * Registra cuando se publican resultados
 */
export async function logResultsPublished(
  workspaceId: string,
  userId: string,
  grandPrixName: string
) {
  await createActivity({
    workspaceId,
    userId,
    type: ActivityType.results_published,
    description: `publicó los resultados del ${grandPrixName}`,
    metadata: { grandPrixName }
  })
}

/**
 * Registra cuando un usuario se une al workspace
 */
export async function logMemberJoined(
  workspaceId: string,
  userId: string
) {
  await createActivity({
    workspaceId,
    userId,
    type: ActivityType.member_joined,
    description: `se unió al juego`,
    metadata: {}
  })
}

/**
 * Obtiene actividades recientes con formato para el dashboard
 */
export async function getDashboardActivities(workspaceId: string) {
  const activities = await getRecentActivities(workspaceId, 5)
  
  return activities.map(activity => {
    const userName = activity.user.name || activity.user.email.split('@')[0]
    
    let icon = 'Activity'
    let color = 'text-gray-500'
    
    switch (activity.type) {
      case ActivityType.prediction_submitted:
        icon = 'Target'
        color = 'text-blue-500'
        break
      case ActivityType.points_earned:
        icon = 'Trophy'
        color = 'text-yellow-500'
        break
      case ActivityType.results_published:
        icon = 'CheckCircle'
        color = 'text-green-500'
        break
      case ActivityType.member_joined:
        icon = 'UserPlus'
        color = 'text-purple-500'
        break
    }
    
    return {
      id: activity.id,
      type: activity.type,
      user: userName,
      description: activity.description,
      time: activity.createdAt,
      metadata: activity.metadata as Record<string, unknown> | null,
      icon,
      color
    }
  })
}