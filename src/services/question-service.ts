import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { QuestionType } from '@prisma/client'

// Schemas de validación
export const createQuestionSchema = z.object({
  text: z.string().min(1).max(200),
  type: z.nativeEnum(QuestionType),
  defaultPoints: z.number().int().min(1).max(100).default(10),
})

export const updateQuestionSchema = createQuestionSchema.partial()

export const createGPQuestionSchema = z.object({
  grandPrixId: z.string().cuid(),
  questionId: z.string().cuid(),
  points: z.number().int().min(1).max(100),
  order: z.number().int().min(1).max(20),
})

export const updateGPQuestionSchema = z.object({
  points: z.number().int().min(1).max(100).optional(),
  order: z.number().int().min(1).max(20).optional(),
})

export type CreateQuestionData = z.infer<typeof createQuestionSchema>
export type UpdateQuestionData = z.infer<typeof updateQuestionSchema>
export type CreateGPQuestionData = z.infer<typeof createGPQuestionSchema>
export type UpdateGPQuestionData = z.infer<typeof updateGPQuestionSchema>

// Funciones de servicio para Question

export async function getAllQuestions() {
  return await prisma.question.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      _count: {
        select: {
          gpQuestions: true,
        },
      },
    },
  })
}

export async function getQuestionById(id: string) {
  return await prisma.question.findUnique({
    where: { id },
    include: {
      gpQuestions: {
        include: {
          grandPrix: {
            include: {
              season: true,
            },
          },
        },
      },
    },
  })
}

export async function getQuestionsByType(type: QuestionType) {
  return await prisma.question.findMany({
    where: { type },
    orderBy: { defaultPoints: 'desc' },
  })
}

export async function createQuestion(data: CreateQuestionData) {
  const validated = createQuestionSchema.parse(data)
  
  // Verificar que no exista una pregunta con el mismo texto
  const existing = await prisma.question.findFirst({
    where: {
      text: validated.text,
    },
  })
  
  if (existing) {
    throw new Error('Ya existe una pregunta con ese texto')
  }
  
  return await prisma.question.create({
    data: validated,
  })
}

export async function updateQuestion(id: string, data: UpdateQuestionData) {
  const validated = updateQuestionSchema.parse(data)
  
  // Si se está actualizando el texto, verificar que no exista
  if (validated.text) {
    const existing = await prisma.question.findFirst({
      where: {
        text: validated.text,
        NOT: { id },
      },
    })
    
    if (existing) {
      throw new Error('Ya existe una pregunta con ese texto')
    }
  }
  
  return await prisma.question.update({
    where: { id },
    data: validated,
  })
}

export async function deleteQuestion(id: string) {
  // Verificar si la pregunta está siendo usada en algún GP
  const gpQuestionsCount = await prisma.gPQuestion.count({
    where: { questionId: id },
  })
  
  if (gpQuestionsCount > 0) {
    throw new Error('No se puede eliminar una pregunta que está asignada a Grand Prix')
  }
  
  return await prisma.question.delete({
    where: { id },
  })
}

// Funciones de servicio para GPQuestion

export async function getGPQuestions(grandPrixId: string) {
  return await prisma.gPQuestion.findMany({
    where: { grandPrixId },
    orderBy: { order: 'asc' },
    include: {
      question: true,
      _count: {
        select: {
          predictions: true,
        },
      },
    },
  })
}

export async function addQuestionToGP(data: CreateGPQuestionData) {
  const validated = createGPQuestionSchema.parse(data)
  
  // Verificar que el GP existe
  const gp = await prisma.grandPrix.findUnique({
    where: { id: validated.grandPrixId },
  })
  
  if (!gp) {
    throw new Error('Grand Prix no encontrado')
  }
  
  // Verificar que la pregunta existe
  const question = await prisma.question.findUnique({
    where: { id: validated.questionId },
  })
  
  if (!question) {
    throw new Error('Pregunta no encontrada')
  }
  
  // Verificar que no exista ya esta pregunta en el GP
  const existing = await prisma.gPQuestion.findUnique({
    where: {
      grandPrixId_questionId: {
        grandPrixId: validated.grandPrixId,
        questionId: validated.questionId,
      },
    },
  })
  
  if (existing) {
    throw new Error('Esta pregunta ya está asignada a este Grand Prix')
  }
  
  return await prisma.gPQuestion.create({
    data: validated,
    include: {
      question: true,
    },
  })
}

export async function updateGPQuestion(id: string, data: UpdateGPQuestionData) {
  const validated = updateGPQuestionSchema.parse(data)
  
  return await prisma.gPQuestion.update({
    where: { id },
    data: validated,
    include: {
      question: true,
    },
  })
}

export async function removeQuestionFromGP(grandPrixId: string, questionId: string) {
  // Verificar si hay predicciones para esta pregunta en este GP
  const predictionsCount = await prisma.prediction.count({
    where: {
      grandPrixId,
      gpQuestion: {
        questionId,
      },
    },
  })
  
  if (predictionsCount > 0) {
    throw new Error('No se puede eliminar una pregunta que tiene predicciones registradas')
  }
  
  return await prisma.gPQuestion.delete({
    where: {
      grandPrixId_questionId: {
        grandPrixId,
        questionId,
      },
    },
  })
}

// Función para reordenar preguntas en un GP
export async function reorderGPQuestions(grandPrixId: string, questionOrders: { id: string; order: number }[]) {
  // Actualizar el orden de todas las preguntas en una transacción
  return await prisma.$transaction(
    questionOrders.map(({ id, order }) =>
      prisma.gPQuestion.update({
        where: { id },
        data: { order },
      })
    )
  )
}

// Función para aplicar preguntas estándar a un GP
export async function applyStandardQuestionsToGP(grandPrixId: string) {
  // Obtener todas las preguntas estándar
  const standardQuestions = await prisma.question.findMany({
    orderBy: { createdAt: 'asc' },
  })
  
  if (standardQuestions.length === 0) {
    throw new Error('No hay preguntas estándar definidas')
  }
  
  // Verificar qué preguntas ya están asignadas
  const existingQuestions = await prisma.gPQuestion.findMany({
    where: { grandPrixId },
    select: { questionId: true },
  })
  
  const existingQuestionIds = new Set(existingQuestions.map(q => q.questionId))
  
  // Filtrar solo las preguntas que no están asignadas
  const questionsToAdd = standardQuestions.filter(q => !existingQuestionIds.has(q.id))
  
  if (questionsToAdd.length === 0) {
    return []
  }
  
  // Obtener el orden máximo actual
  const maxOrder = await prisma.gPQuestion.findFirst({
    where: { grandPrixId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })
  
  const startOrder = (maxOrder?.order || 0) + 1
  
  // Crear las asignaciones
  const newGPQuestions = await prisma.gPQuestion.createMany({
    data: questionsToAdd.map((question, index) => ({
      grandPrixId,
      questionId: question.id,
      points: question.defaultPoints,
      order: startOrder + index,
    })),
  })
  
  return newGPQuestions
}