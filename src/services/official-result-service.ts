import { z } from "zod"
import { prisma } from "@/lib/prisma"

// Schema para crear/actualizar resultado oficial
export const upsertOfficialResultSchema = z.object({
  grandPrixId: z.string().cuid(),
  gpQuestionId: z.string().cuid(),
  answer: z.string().min(1, "La respuesta es requerida"),
})

export type UpsertOfficialResultData = z.infer<typeof upsertOfficialResultSchema>

/**
 * Crea o actualiza el resultado oficial para una pregunta
 */
export async function upsertOfficialResult(
  data: UpsertOfficialResultData,
  userId: string
) {
  const validated = upsertOfficialResultSchema.parse(data)
  
  // Verificar que el admin tenga permisos
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  
  if (!user?.role || user.role !== "superadmin") {
    throw new Error("Solo los superadmins pueden ingresar resultados oficiales")
  }
  
  return await prisma.officialResult.upsert({
    where: {
      gpQuestionId: validated.gpQuestionId,
    },
    update: {
      answer: validated.answer,
      updatedAt: new Date(),
    },
    create: {
      ...validated,
      createdById: userId,
    },
    include: {
      gpQuestion: {
        select: {
          id: true,
          text: true,
          type: true,
          category: true,
          points: true,
        },
      },
    },
  })
}

/**
 * Obtiene todos los resultados oficiales de un Grand Prix
 */
export async function getOfficialResultsByGrandPrix(grandPrixId: string) {
  return await prisma.officialResult.findMany({
    where: { grandPrixId },
    include: {
      gpQuestion: {
        select: {
          id: true,
          text: true,
          type: true,
          category: true,
          points: true,
          order: true,
          question: {
            select: {
              text: true,
              type: true,
            },
          },
          template: {
            select: {
              text: true,
              type: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      gpQuestion: {
        order: 'asc',
      },
    },
  })
}

/**
 * Obtiene el resultado oficial de una pregunta específica
 */
export async function getOfficialResultByQuestion(gpQuestionId: string) {
  return await prisma.officialResult.findUnique({
    where: { gpQuestionId },
  })
}

/**
 * Elimina todos los resultados oficiales de un Grand Prix
 */
export async function deleteOfficialResultsByGrandPrix(
  grandPrixId: string,
  userId: string
) {
  // Verificar permisos
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  
  if (!user?.role || user.role !== "superadmin") {
    throw new Error("Solo los superadmins pueden eliminar resultados oficiales")
  }
  
  return await prisma.officialResult.deleteMany({
    where: { grandPrixId },
  })
}

/**
 * Verifica si un Grand Prix tiene todos los resultados oficiales
 */
export async function hasCompleteOfficialResults(grandPrixId: string) {
  const [totalQuestions, officialResults] = await Promise.all([
    prisma.gPQuestion.count({
      where: { grandPrixId },
    }),
    prisma.officialResult.count({
      where: { grandPrixId },
    }),
  ])
  
  return {
    isComplete: totalQuestions === officialResults,
    totalQuestions,
    officialResults,
    missing: totalQuestions - officialResults,
  }
}

/**
 * Obtiene las preguntas con sus resultados oficiales para un GP
 */
export async function getQuestionsWithOfficialResults(grandPrixId: string) {
  const questions = await prisma.gPQuestion.findMany({
    where: { grandPrixId },
    include: {
      question: true,
      template: true,
      officialResult: true,
    },
    orderBy: [
      { category: 'asc' },
      { order: 'asc' },
    ],
  })
  
  return questions.map(q => ({
    id: q.id,
    text: q.text || q.question?.text || q.template?.text || '',
    type: q.type || q.question?.type || q.template?.type,
    category: q.category || q.question?.category || q.template?.category,
    points: q.points,
    options: q.options || q.question?.options || q.template?.defaultOptions,
    order: q.order,
    officialAnswer: q.officialResult?.answer || null,
    hasResult: !!q.officialResult,
  }))
}