import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { Prediction, User, GrandPrix, GPQuestion } from "@prisma/client"

// Schemas de validación
export const createPredictionSchema = z.object({
  workspaceSeasonId: z.string(),
  userId: z.string(),
  grandPrixId: z.string(),
  gpQuestionId: z.string(),
  answer: z.string().min(1, "La respuesta es requerida")
})

export const createMultiplePredictionsSchema = z.object({
  workspaceSeasonId: z.string(),
  userId: z.string(),
  grandPrixId: z.string(),
  predictions: z.array(z.object({
    gpQuestionId: z.string(),
    answer: z.string().min(1, "La respuesta es requerida")
  }))
})

// Tipos derivados
export type CreatePredictionData = z.infer<typeof createPredictionSchema>
export type CreateMultiplePredictionsData = z.infer<typeof createMultiplePredictionsSchema>

export type PredictionWithDetails = Prediction & {
  user: User
  grandPrix: GrandPrix
  gpQuestion: GPQuestion & {
    question?: {
      text: string
      type: string
    } | null
  }
}

/**
 * Crea una predicción individual
 */
export async function createPrediction(data: CreatePredictionData): Promise<Prediction> {
  const validated = createPredictionSchema.parse(data)
  
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
  
  return await prisma.prediction.create({
    data: validated
  })
}

/**
 * Crea múltiples predicciones para un GP
 */
export async function createMultiplePredictions(data: CreateMultiplePredictionsData): Promise<Prediction[]> {
  const validated = createMultiplePredictionsSchema.parse(data)
  
  // Verificar deadline
  const grandPrix = await prisma.grandPrix.findUnique({
    where: { id: validated.grandPrixId }
  })
  
  if (!grandPrix) {
    throw new Error("Grand Prix no encontrado")
  }
  
  if (new Date() > grandPrix.qualifyingDate) {
    throw new Error("El deadline para predicciones ha pasado")
  }
  
  // Crear todas las predicciones en una transacción
  return await prisma.$transaction(
    validated.predictions.map(pred => 
      prisma.prediction.create({
        data: {
          workspaceSeasonId: validated.workspaceSeasonId,
          userId: validated.userId,
          grandPrixId: validated.grandPrixId,
          gpQuestionId: pred.gpQuestionId,
          answer: pred.answer
        }
      })
    )
  )
}

/**
 * Obtiene las predicciones de un usuario para un GP
 */
export async function getUserPredictionsForGP(
  userId: string,
  grandPrixId: string,
  workspaceSeasonId: string
): Promise<PredictionWithDetails[]> {
  return await prisma.prediction.findMany({
    where: {
      userId,
      grandPrixId,
      workspaceSeasonId
    },
    include: {
      user: true,
      grandPrix: true,
      gpQuestion: {
        include: {
          question: true
        }
      }
    }
  })
}

/**
 * Verifica si un usuario ya hizo predicciones para un GP
 */
export async function hasUserPredictedForGP(
  userId: string,
  grandPrixId: string,
  workspaceSeasonId: string
): Promise<boolean> {
  const count = await prisma.prediction.count({
    where: {
      userId,
      grandPrixId,
      workspaceSeasonId
    }
  })
  
  return count > 0
}

/**
 * Obtiene todas las predicciones de un workspace para un GP
 */
export async function getWorkspacePredictionsForGP(
  workspaceSeasonId: string,
  grandPrixId: string
): Promise<PredictionWithDetails[]> {
  return await prisma.prediction.findMany({
    where: {
      workspaceSeasonId,
      grandPrixId
    },
    include: {
      user: true,
      grandPrix: true,
      gpQuestion: {
        include: {
          question: true
        }
      }
    },
    orderBy: {
      submittedAt: 'desc'
    }
  })
}

/**
 * Actualiza los puntos ganados de una predicción
 */
export async function updatePredictionPoints(
  predictionId: string,
  earnedPoints: number
): Promise<Prediction> {
  return await prisma.prediction.update({
    where: { id: predictionId },
    data: { earnedPoints }
  })
}

/**
 * Obtiene el historial de predicciones de un usuario en un workspace
 */
export async function getUserPredictionHistory(
  userId: string,
  workspaceSeasonId: string
): Promise<PredictionWithDetails[]> {
  return await prisma.prediction.findMany({
    where: {
      userId,
      workspaceSeasonId
    },
    include: {
      user: true,
      grandPrix: true,
      gpQuestion: {
        include: {
          question: true
        }
      }
    },
    orderBy: {
      grandPrix: {
        round: 'desc'
      }
    }
  })
}