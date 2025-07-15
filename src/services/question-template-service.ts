import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { QuestionType, QuestionCategory, Prisma } from '@prisma/client'

// Schemas de validación
export const createQuestionTemplateSchema = z.object({
  text: z.string().min(1).max(500),
  type: z.nativeEnum(QuestionType),
  category: z.enum(['CLASSIC', 'STROLLOMETER']), // Solo estas dos categorías para plantillas
  defaultPoints: z.number().int().min(1).max(100).default(10),
  badge: z.string().optional(),
  defaultOptions: z.any().optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
})

export const updateQuestionTemplateSchema = createQuestionTemplateSchema.partial()

export type CreateQuestionTemplateData = z.infer<typeof createQuestionTemplateSchema>
export type UpdateQuestionTemplateData = z.infer<typeof updateQuestionTemplateSchema>

// Funciones de servicio

export async function getAllQuestionTemplates() {
  return await prisma.questionTemplate.findMany({
    where: { isActive: true },
    orderBy: [
      { category: 'asc' },
      { createdAt: 'asc' },
    ],
    include: {
      _count: {
        select: {
          gpQuestions: true,
        },
      },
    },
  })
}

export async function getQuestionTemplateById(id: string) {
  return await prisma.questionTemplate.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          gpQuestions: true,
        },
      },
    },
  })
}

export async function getQuestionTemplatesByCategory(category: 'CLASSIC' | 'STROLLOMETER') {
  return await prisma.questionTemplate.findMany({
    where: { 
      category: category as QuestionCategory,
      isActive: true,
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function createQuestionTemplate(data: CreateQuestionTemplateData) {
  const validated = createQuestionTemplateSchema.parse(data)
  
  // Verificar que no exista una plantilla con el mismo texto en la misma categoría
  const existing = await prisma.questionTemplate.findFirst({
    where: {
      text: validated.text,
      category: validated.category as QuestionCategory,
    },
  })
  
  if (existing) {
    throw new Error('Ya existe una plantilla con ese texto en esta categoría')
  }
  
  return await prisma.questionTemplate.create({
    data: {
      ...validated,
      category: validated.category as QuestionCategory,
    },
  })
}

export async function updateQuestionTemplate(id: string, data: UpdateQuestionTemplateData) {
  const validated = updateQuestionTemplateSchema.parse(data)
  
  // Si se está actualizando el texto, verificar que no exista
  if (validated.text || validated.category) {
    const template = await prisma.questionTemplate.findUnique({
      where: { id },
      select: { category: true },
    })
    
    if (!template) {
      throw new Error('Plantilla no encontrada')
    }
    
    const existing = await prisma.questionTemplate.findFirst({
      where: {
        text: validated.text || undefined,
        category: (validated.category || template.category) as QuestionCategory,
        NOT: { id },
      },
    })
    
    if (existing) {
      throw new Error('Ya existe una plantilla con ese texto en esta categoría')
    }
  }
  
  // Preparar los datos de actualización
  const updateData: Prisma.QuestionTemplateUpdateInput = {
    ...validated,
    // Si el badge está undefined, convertirlo explícitamente a null para eliminarlo
    badge: validated.badge === undefined ? null : validated.badge,
    category: validated.category as QuestionCategory | undefined,
  }
  
  return await prisma.questionTemplate.update({
    where: { id },
    data: updateData,
  })
}

export async function deleteQuestionTemplate(id: string) {
  // Verificar si la plantilla está siendo usada
  const usageCount = await prisma.gPQuestion.count({
    where: { templateId: id },
  })
  
  if (usageCount > 0) {
    // En lugar de eliminar, la desactivamos
    return await prisma.questionTemplate.update({
      where: { id },
      data: { isActive: false },
    })
  }
  
  return await prisma.questionTemplate.delete({
    where: { id },
  })
}

// Función para copiar una plantilla a un GP como pregunta editable
export async function createGPQuestionFromTemplate(
  templateId: string, 
  grandPrixId: string,
  customData?: {
    points?: number
    order?: number
    text?: string
    options?: unknown
  }
) {
  const template = await prisma.questionTemplate.findUnique({
    where: { id: templateId },
  })
  
  if (!template) {
    throw new Error('Plantilla no encontrada')
  }
  
  // Obtener el orden máximo actual en el GP
  const maxOrder = await prisma.gPQuestion.findFirst({
    where: { grandPrixId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })
  
  const order = customData?.order ?? ((maxOrder?.order || 0) + 1)
  
  // Crear la pregunta del GP basada en la plantilla
  return await prisma.gPQuestion.create({
    data: {
      grandPrixId,
      templateId, // Mantener referencia a la plantilla origen
      text: customData?.text || template.text,
      type: template.type,
      category: template.category,
      badge: template.badge,
      points: customData?.points || template.defaultPoints,
      options: (customData?.options || template.defaultOptions) as Prisma.InputJsonValue,
      order,
    },
    include: {
      template: true,
    },
  })
}

// Función para aplicar múltiples plantillas a un GP
export async function applyTemplatesToGP(
  grandPrixId: string,
  templateIds: string[]
) {
  // Verificar que el GP existe
  const gp = await prisma.grandPrix.findUnique({
    where: { id: grandPrixId },
  })
  
  if (!gp) {
    throw new Error('Grand Prix no encontrado')
  }
  
  // Obtener las plantillas
  const templates = await prisma.questionTemplate.findMany({
    where: {
      id: { in: templateIds },
      isActive: true,
    },
  })
  
  if (templates.length !== templateIds.length) {
    throw new Error('Algunas plantillas no fueron encontradas')
  }
  
  // Obtener el orden máximo actual
  const maxOrder = await prisma.gPQuestion.findFirst({
    where: { grandPrixId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })
  
  const startOrder = (maxOrder?.order || 0) + 1
  
  // Crear las preguntas basadas en las plantillas
  const gpQuestions = templates.map((template, index) => ({
    grandPrixId,
    templateId: template.id,
    text: template.text,
    type: template.type,
    category: template.category,
    badge: template.badge,
    points: template.defaultPoints,
    options: template.defaultOptions as Prisma.InputJsonValue,
    order: startOrder + index,
  }))
  
  return await prisma.gPQuestion.createMany({
    data: gpQuestions,
  })
}