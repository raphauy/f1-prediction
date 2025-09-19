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
      status: 'ACTIVE', // Solo GPs activos, no pausados
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

/**
 * Tipos para el historial de predicciones
 */
export type PredictionWithResult = {
  id: string
  gpQuestionId: string
  answer: string
  isCorrect: boolean | null  // null si no hay resultado oficial
  pointsEarned: number
  officialAnswer: string | null
  submittedAt: Date
  updatedAt: Date
  question: {
    text: string
    type: string
    category: string
    badge: string | null
    points: number
    order: number
    options?: Record<string, unknown>
  }
}

export type GrandPrixWithPredictions = {
  id: string
  name: string
  location: string
  country: string
  circuit: string
  round: number
  raceDate: Date
  qualifyingDate: Date
  status: string
  hasPredictions: boolean
  predictionsCount: number
  correctPredictions: number
  totalPoints: number
}

/**
 * Obtiene los Grand Prix con predicciones del usuario para mostrar el historial
 */
export async function getUserGrandPrixWithPredictions(
  userId: string,
  seasonId: string
): Promise<GrandPrixWithPredictions[]> {
  // Obtener todos los GPs de la temporada con las predicciones del usuario
  const grandPrix = await prisma.grandPrix.findMany({
    where: {
      seasonId,
      status: {
        in: ['ACTIVE', 'FINISHED']
      }
    },
    include: {
      predictions: {
        where: { userId },
        include: {
          earnedPoints: true,
          gpQuestion: {
            include: {
              officialResult: true
            }
          }
        }
      }
    },
    orderBy: { raceDate: 'desc' }
  })

  // Mapear y calcular estadísticas
  return grandPrix.map(gp => {
    const predictions = gp.predictions
    const correctCount = predictions.filter(p =>
      p.gpQuestion.officialResult?.answer === p.answer
    ).length

    // Calcular puntos totales sumando todos los PredictionPoints
    const totalPoints = predictions.reduce((sum, p) => {
      const predictionPoints = p.earnedPoints.reduce((pSum, ep) => pSum + ep.points, 0)
      return sum + predictionPoints
    }, 0)

    return {
      id: gp.id,
      name: gp.name,
      location: gp.location,
      country: gp.country,
      circuit: gp.circuit,
      round: gp.round,
      raceDate: gp.raceDate,
      qualifyingDate: gp.qualifyingDate,
      status: gp.status,
      hasPredictions: predictions.length > 0,
      predictionsCount: predictions.length,
      correctPredictions: correctCount,
      totalPoints
    }
  })
}

/**
 * Obtiene las predicciones del usuario con los resultados oficiales para un GP específico
 */
export async function getUserPredictionsWithResults(
  userId: string,
  grandPrixId: string
): Promise<PredictionWithResult[]> {
  // Obtener predicciones con resultados oficiales
  const predictions = await prisma.prediction.findMany({
    where: {
      userId,
      grandPrixId
    },
    include: {
      gpQuestion: {
        include: {
          officialResult: true,
          question: true
        }
      },
      earnedPoints: true
    }
  })

  // Mapear a formato con resultado
  return predictions.map(p => {
    const officialResult = p.gpQuestion.officialResult
    const isCorrect = officialResult ? p.answer === officialResult.answer : null
    const pointsEarned = p.earnedPoints.reduce((sum, ep) => sum + ep.points, 0)

    return {
      id: p.id,
      gpQuestionId: p.gpQuestionId,
      answer: p.answer,
      isCorrect,
      pointsEarned,
      officialAnswer: officialResult?.answer || null,
      submittedAt: p.submittedAt,
      updatedAt: p.updatedAt,
      question: {
        text: p.gpQuestion.text || p.gpQuestion.question?.text || '',
        type: p.gpQuestion.type || p.gpQuestion.question?.type || 'TEXT',
        category: p.gpQuestion.category || p.gpQuestion.question?.category || 'CLASSIC',
        badge: p.gpQuestion.badge || p.gpQuestion.question?.badge || null,
        points: p.gpQuestion.points,
        order: p.gpQuestion.order,
        options: (p.gpQuestion.options || p.gpQuestion.question?.options) as Record<string, unknown> | undefined
      }
    }
  })
}

/**
 * Obtiene las preguntas del GP con predicciones y resultados oficiales
 */
export async function getGPQuestionsWithResults(
  grandPrixId: string,
  userId: string
) {
  const gpQuestions = await prisma.gPQuestion.findMany({
    where: { grandPrixId },
    include: {
      question: true,
      predictions: {
        where: { userId }
      },
      officialResult: true
    },
    orderBy: [
      { order: 'asc' },
      { id: 'asc' }
    ]
  })

  return gpQuestions.map(q => {
    const prediction = q.predictions[0]
    const officialResult = q.officialResult
    const isCorrect = prediction && officialResult ?
      prediction.answer === officialResult.answer : null

    return {
      id: q.id,
      text: q.text || q.question?.text || '',
      type: q.type || q.question?.type,
      category: q.category || q.question?.category,
      badge: q.badge || q.question?.badge,
      points: q.points,
      order: q.order,
      options: (q.options || q.question?.options) as Record<string, unknown> | undefined,
      userPrediction: prediction || null,
      officialResult: officialResult || null,
      isCorrect
    }
  })
}