import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { QuestionType, QuestionCategory } from '@prisma/client'
import { createGPQuestionFromTemplate as createFromTemplate } from './question-template-service'

// Schemas de validación
export const createQuestionSchema = z.object({
  text: z.string().min(1).max(200),
  type: z.nativeEnum(QuestionType),
  category: z.nativeEnum(QuestionCategory),
  defaultPoints: z.number().int().min(1).max(100).default(10),
  badge: z.string().optional(),
  options: z.any().optional(),
})

export const updateQuestionSchema = createQuestionSchema.partial()

export const createGPQuestionSchema = z.object({
  grandPrixId: z.string().cuid(),
  questionId: z.string().cuid().optional(),
  points: z.number().int().min(1).max(100),
  order: z.number().int().min(1).max(100),
  // Para preguntas inline
  text: z.string().min(1).max(500).optional(),
  type: z.nativeEnum(QuestionType).optional(),
  category: z.enum(['CLASSIC', 'PILOT_FOCUS', 'STROLLOMETER']).optional(),
  badge: z.string().optional(),
  options: z.any().optional(),
})

export const updateGPQuestionSchema = z.object({
  points: z.number().int().min(1).max(100).optional(),
  order: z.number().int().min(1).max(100).optional(),
  text: z.string().min(1).max(500).optional(),
  type: z.nativeEnum(QuestionType).optional(),
  badge: z.string().optional(),
  options: z.any().optional(),
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

export async function getQuestionsByCategory(category: QuestionCategory) {
  return await prisma.question.findMany({
    where: { category },
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

export async function getClassicQuestions() {
  return await getQuestionsByCategory(QuestionCategory.CLASSIC)
}

export async function getStrollometerQuestions() {
  return await getQuestionsByCategory(QuestionCategory.STROLLOMETER)
}

export async function getPilotFocusQuestions() {
  return await getQuestionsByCategory(QuestionCategory.PILOT_FOCUS)
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
  const gpQuestions = await prisma.gPQuestion.findMany({
    where: { grandPrixId },
    orderBy: { order: 'asc' },
    include: {
      question: true,
      template: true,
      _count: {
        select: {
          predictions: true,
        },
      },
    },
  })
  
  // Transformar para que las preguntas inline tengan la estructura esperada
  return gpQuestions.map(gpq => ({
    ...gpq,
    question: gpq.question || {
      id: `inline-${gpq.id}`,
      text: gpq.text!,
      type: gpq.type!,
      category: gpq.category!,
      badge: gpq.badge,
      defaultPoints: gpq.points,
      options: gpq.options,
      createdAt: gpq.createdAt,
      updatedAt: gpq.updatedAt,
    },
  }))
}

export async function getGPQuestionsByCategory(grandPrixId: string) {
  const questions = await getGPQuestions(grandPrixId)

  // Agrupar por categoría
  const grouped = {
    [QuestionCategory.CLASSIC]: [] as typeof questions,
    [QuestionCategory.PILOT_FOCUS]: [] as typeof questions,
    [QuestionCategory.STROLLOMETER]: [] as typeof questions,
  }

  questions.forEach(q => {
    grouped[q.question.category].push(q)
  })

  return grouped
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
  
  // Si es una pregunta de biblioteca
  if (validated.questionId) {
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
  } else {
    // Es una pregunta inline, validar que tenga los campos necesarios
    if (!validated.text || !validated.type || !validated.category) {
      throw new Error('Las preguntas inline requieren texto, tipo y categoría')
    }
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

export async function removeQuestionFromGP(grandPrixId: string, questionIdOrGPQuestionId: string) {
  // Determinar si es una pregunta inline (empieza con "inline-") o de biblioteca
  const isInline = questionIdOrGPQuestionId.startsWith('inline-')
  
  if (isInline) {
    // Es una pregunta inline, usar el GPQuestion ID directamente
    const gpQuestionId = questionIdOrGPQuestionId.replace('inline-', '')
    
    // Verificar si hay predicciones
    const predictionsCount = await prisma.prediction.count({
      where: {
        gpQuestionId,
      },
    })
    
    if (predictionsCount > 0) {
      throw new Error('No se puede eliminar una pregunta que tiene predicciones registradas')
    }
    
    return await prisma.gPQuestion.delete({
      where: { id: gpQuestionId },
    })
  } else {
    // Es una pregunta de biblioteca
    // Verificar si hay predicciones para esta pregunta en este GP
    const predictionsCount = await prisma.prediction.count({
      where: {
        grandPrixId,
        gpQuestion: {
          questionId: questionIdOrGPQuestionId,
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
          questionId: questionIdOrGPQuestionId,
        },
      },
    })
  }
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
  // Obtener preguntas clásicas y del Strollómetro
  const standardQuestions = await prisma.question.findMany({
    where: {
      category: {
        in: [QuestionCategory.CLASSIC, QuestionCategory.STROLLOMETER]
      }
    },
    orderBy: [
      { category: 'asc' },
      { createdAt: 'asc' }
    ],
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

export async function createPilotFocusQuestionsForGP(grandPrixId: string, pilotName: string) {
  // Obtener el máximo orden actual
  const existingQuestions = await getGPQuestions(grandPrixId)
  const currentMaxOrder = Math.max(...existingQuestions.map(q => q.order), 0)
  
  const pilotQuestions = [
    {
      text: `¿En qué posición clasificará ${pilotName}?`,
      type: 'MULTIPLE_CHOICE' as const,
      defaultPoints: 8,
      options: { type: 'custom', values: ['P1-P5', 'P6-P10', 'P11-P15', 'P16-P20'] }
    },
    {
      text: `¿En qué posición terminará ${pilotName} la carrera?`,
      type: 'MULTIPLE_CHOICE' as const,
      defaultPoints: 10,
      options: { type: 'custom', values: ['Podio (P1-P3)', 'P4-P5', 'P6-P10', 'P11-P15', 'P16-P20', 'No termina'] }
    },
    {
      text: `¿${pilotName} ganará posiciones en carrera respecto a la clasificación?`,
      type: 'MULTIPLE_CHOICE' as const,
      defaultPoints: 6,
      options: { type: 'custom', values: ['Sí, gana posiciones', 'No, pierde posiciones', 'Mantiene la posición'] }
    },
    {
      text: `¿${pilotName} terminará por delante de su compañero de equipo?`,
      type: 'BOOLEAN' as const,
      defaultPoints: 5,
      options: { type: 'boolean' }
    }
  ]
  
  // Crear las preguntas inline directamente en GPQuestion
  const gpQuestions = pilotQuestions.map((q, index) => ({
    grandPrixId,
    text: q.text,
    type: q.type,
    category: QuestionCategory.PILOT_FOCUS,
    points: q.defaultPoints,
    options: q.options,
    order: currentMaxOrder + index + 1,
  }))
  
  // Log para depurar
  console.log('Creando preguntas de piloto:', gpQuestions.map(q => ({ text: q.text, type: q.type })))
  
  return await prisma.gPQuestion.createMany({
    data: gpQuestions,
  })
}

// Re-exportar la función de crear desde plantilla para facilitar el uso
export const createGPQuestionFromTemplate = createFromTemplate