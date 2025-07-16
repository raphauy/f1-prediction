import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { Prediction, User, GrandPrix, GPQuestion } from "@prisma/client"

// Schemas de validación
export const upsertPredictionSchema = z.object({
  userId: z.string(),
  grandPrixId: z.string(),
  gpQuestionId: z.string(),
  answer: z.string().min(1, "La respuesta es requerida")
})

export const createPredictionPointsSchema = z.object({
  predictionId: z.string(),
  workspaceSeasonId: z.string(),
  points: z.number().int().min(0)
})

// Tipos derivados
export type UpsertPredictionData = z.infer<typeof upsertPredictionSchema>
export type CreatePredictionPointsData = z.infer<typeof createPredictionPointsSchema>

export type PredictionWithDetails = Prediction & {
  user: User
  grandPrix: GrandPrix
  gpQuestion: GPQuestion & {
    question?: {
      text: string
      type: string
    } | null
  }
  earnedPoints?: Array<{
    id: string
    predictionId: string
    workspaceSeasonId: string
    points: number
    createdAt: Date
    updatedAt: Date
  }>
}

/**
 * Crea o actualiza una predicción global del usuario
 */
export async function upsertUserPrediction(data: UpsertPredictionData): Promise<Prediction> {
  const validated = upsertPredictionSchema.parse(data)
  
  // Verificar que el deadline no haya pasado
  const grandPrix = await prisma.grandPrix.findUnique({
    where: { id: validated.grandPrixId }
  })
  
  if (!grandPrix) {
    throw new Error("Grand Prix no encontrado")
  }
  
  if (new Date() > grandPrix.qualifyingDate) {
    throw new Error("El deadline para predicciones ha pasado")
  }
  
  return await prisma.prediction.upsert({
    where: {
      userId_grandPrixId_gpQuestionId: {
        userId: validated.userId,
        grandPrixId: validated.grandPrixId,
        gpQuestionId: validated.gpQuestionId
      }
    },
    update: {
      answer: validated.answer
    },
    create: {
      userId: validated.userId,
      grandPrixId: validated.grandPrixId,
      gpQuestionId: validated.gpQuestionId,
      answer: validated.answer
    }
  })
}

/**
 * Crea puntos de predicción para un workspace específico
 */
export async function createPredictionPoints(data: CreatePredictionPointsData) {
  const validated = createPredictionPointsSchema.parse(data)
  
  return await prisma.predictionPoints.upsert({
    where: {
      predictionId_workspaceSeasonId: {
        predictionId: validated.predictionId,
        workspaceSeasonId: validated.workspaceSeasonId
      }
    },
    update: {
      points: validated.points,
      updatedAt: new Date()
    },
    create: validated
  })
}

/**
 * Obtiene las predicciones de un usuario para un GP (globales)
 */
export async function getUserPredictionsForGP(
  userId: string,
  grandPrixId: string
): Promise<PredictionWithDetails[]> {
  return await prisma.prediction.findMany({
    where: {
      userId,
      grandPrixId
    },
    include: {
      user: true,
      grandPrix: true,
      gpQuestion: {
        include: {
          question: true
        }
      },
      earnedPoints: true
    }
  })
}

/**
 * Verifica si un usuario ya hizo predicciones para un GP
 */
export async function hasUserPredictedForGP(
  userId: string,
  grandPrixId: string
): Promise<boolean> {
  const count = await prisma.prediction.count({
    where: {
      userId,
      grandPrixId
    }
  })
  
  return count > 0
}

/**
 * Obtiene el GP activo para predicciones
 */
export async function getActiveGPForPredictions(seasonId: string) {
  const now = new Date()
  
  return await prisma.grandPrix.findFirst({
    where: {
      seasonId,
      qualifyingDate: {
        gt: now // Deadline aún no ha pasado
      }
    },
    orderBy: {
      qualifyingDate: 'asc' // Ordenar por fecha más próxima, no por ronda
    },
    include: {
      season: true,
      gpQuestions: {
        include: {
          question: true
        },
        orderBy: [
          { order: 'asc' },
          { id: 'asc' }
        ]
      }
    }
  })
}

/**
 * Obtiene los workspaces activos de un usuario para la temporada actual
 */
export async function getUserActiveWorkspaceSeasons(userId: string) {
  return await prisma.workspaceSeason.findMany({
    where: {
      isActive: true,
      workspace: {
        users: {
          some: {
            userId
          }
        }
      },
      season: {
        isActive: true
      }
    },
    include: {
      workspace: true,
      season: true
    }
  })
}

/**
 * Obtiene las preguntas del GP con las predicciones del usuario
 */
export async function getGPQuestionsWithUserPredictions(
  grandPrixId: string,
  userId: string
) {
  const gpQuestions = await prisma.gPQuestion.findMany({
    where: { grandPrixId },
    include: {
      question: true,
      predictions: {
        where: { userId }
      }
    },
    orderBy: [
      { order: 'asc' },
      { id: 'asc' }
    ]
  })
  
  return gpQuestions.map(q => ({
    id: q.id,
    text: q.text || q.question?.text || '',
    type: q.type || q.question?.type,
    category: q.category || q.question?.category,
    badge: q.badge || q.question?.badge,
    points: q.points,
    order: q.order,
    options: (q.options || q.question?.options) as Record<string, unknown> | undefined,
    userPrediction: q.predictions[0] || null
  }))
}