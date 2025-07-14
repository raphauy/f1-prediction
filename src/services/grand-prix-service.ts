import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Schemas de validación
export const createGrandPrixSchema = z.object({
  seasonId: z.string().cuid(),
  round: z.number().int().min(1).max(30),
  name: z.string().min(1).max(100),
  location: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  circuit: z.string().min(1).max(100),
  raceDate: z.date(),
  qualifyingDate: z.date(),
  isSprint: z.boolean().default(false),
  timezone: z.string().min(1).max(50),
})

export const updateGrandPrixSchema = createGrandPrixSchema.partial().omit({ seasonId: true })

export type CreateGrandPrixData = z.infer<typeof createGrandPrixSchema>
export type UpdateGrandPrixData = z.infer<typeof updateGrandPrixSchema>

// Funciones de servicio

export async function getAllGrandPrix(seasonId?: string) {
  const where: Prisma.GrandPrixWhereInput = seasonId ? { seasonId } : {}
  
  return await prisma.grandPrix.findMany({
    where,
    orderBy: [
      { season: { year: 'desc' } },
      { round: 'asc' },
    ],
    include: {
      season: true,
      _count: {
        select: {
          predictions: true,
          gpQuestions: true,
        },
      },
    },
  })
}

export async function getGrandPrixById(id: string) {
  return await prisma.grandPrix.findUnique({
    where: { id },
    include: {
      season: true,
      gpQuestions: {
        include: {
          question: true,
        },
        orderBy: { order: 'asc' },
      },
      _count: {
        select: {
          predictions: true,
        },
      },
    },
  })
}

export async function getGrandPrixBySeasonAndRound(seasonId: string, round: number) {
  return await prisma.grandPrix.findFirst({
    where: {
      seasonId,
      round,
    },
    include: {
      gpQuestions: {
        include: {
          question: true,
        },
        orderBy: { order: 'asc' },
      },
    },
  })
}

export async function createGrandPrix(data: CreateGrandPrixData) {
  const validated = createGrandPrixSchema.parse(data)
  
  // Verificar que la temporada existe
  const season = await prisma.season.findUnique({
    where: { id: validated.seasonId },
  })
  
  if (!season) {
    throw new Error('La temporada especificada no existe')
  }
  
  // Verificar que no exista un GP con el mismo round en la temporada
  const existing = await prisma.grandPrix.findFirst({
    where: {
      seasonId: validated.seasonId,
      round: validated.round,
    },
  })
  
  if (existing) {
    throw new Error(`Ya existe un Grand Prix con el round ${validated.round} en esta temporada`)
  }
  
  // Validar que la fecha de clasificación sea antes que la de carrera
  if (validated.qualifyingDate >= validated.raceDate) {
    throw new Error('La fecha de clasificación debe ser anterior a la fecha de carrera')
  }
  
  // Crear el Grand Prix
  const grandPrix = await prisma.grandPrix.create({
    data: validated,
    include: {
      season: true,
    },
  })
  
  // Obtener las preguntas estándar y asignarlas automáticamente
  const standardQuestions = await prisma.question.findMany({
    orderBy: { createdAt: 'asc' },
  })
  
  if (standardQuestions.length > 0) {
    await prisma.gPQuestion.createMany({
      data: standardQuestions.map((question, index) => ({
        grandPrixId: grandPrix.id,
        questionId: question.id,
        points: question.defaultPoints,
        order: index + 1,
      })),
    })
  }
  
  return grandPrix
}

export async function updateGrandPrix(id: string, data: UpdateGrandPrixData) {
  const validated = updateGrandPrixSchema.parse(data)
  
  // Si se está actualizando el round, verificar que no exista
  if (validated.round !== undefined) {
    const gp = await prisma.grandPrix.findUnique({
      where: { id },
      select: { seasonId: true },
    })
    
    if (!gp) {
      throw new Error('Grand Prix no encontrado')
    }
    
    const existing = await prisma.grandPrix.findFirst({
      where: {
        seasonId: gp.seasonId,
        round: validated.round,
        NOT: { id },
      },
    })
    
    if (existing) {
      throw new Error(`Ya existe un Grand Prix con el round ${validated.round} en esta temporada`)
    }
  }
  
  // Validar fechas si se proporcionan
  if (validated.qualifyingDate && validated.raceDate) {
    if (validated.qualifyingDate >= validated.raceDate) {
      throw new Error('La fecha de clasificación debe ser anterior a la fecha de carrera')
    }
  }
  
  return await prisma.grandPrix.update({
    where: { id },
    data: validated,
    include: {
      season: true,
      _count: {
        select: {
          predictions: true,
          gpQuestions: true,
        },
      },
    },
  })
}

export async function deleteGrandPrix(id: string) {
  // Verificar si hay predicciones para este GP
  const predictionsCount = await prisma.prediction.count({
    where: { grandPrixId: id },
  })
  
  if (predictionsCount > 0) {
    throw new Error('No se puede eliminar un Grand Prix que tiene predicciones registradas')
  }
  
  // Las relaciones en cascada eliminarán GPQuestions automáticamente
  return await prisma.grandPrix.delete({
    where: { id },
  })
}

// Funciones auxiliares

export async function getUpcomingGrandPrix(workspaceId: string) {
  const now = new Date()
  
  // Obtener la temporada activa del workspace
  const activeWorkspaceSeason = await prisma.workspaceSeason.findFirst({
    where: {
      workspaceId,
      isActive: true,
    },
    select: { seasonId: true },
  })
  
  if (!activeWorkspaceSeason) {
    return null
  }
  
  // Obtener el próximo GP (donde la fecha de clasificación aún no ha pasado)
  return await prisma.grandPrix.findFirst({
    where: {
      seasonId: activeWorkspaceSeason.seasonId,
      qualifyingDate: {
        gt: now,
      },
    },
    orderBy: { raceDate: 'asc' },
    include: {
      season: true,
      gpQuestions: {
        include: {
          question: true,
        },
        orderBy: { order: 'asc' },
      },
    },
  })
}

export async function getPastGrandPrix(workspaceId: string) {
  const now = new Date()
  
  // Obtener la temporada activa del workspace
  const activeWorkspaceSeason = await prisma.workspaceSeason.findFirst({
    where: {
      workspaceId,
      isActive: true,
    },
    select: { seasonId: true },
  })
  
  if (!activeWorkspaceSeason) {
    return []
  }
  
  // Obtener GPs pasados (donde la fecha de carrera ya pasó)
  return await prisma.grandPrix.findMany({
    where: {
      seasonId: activeWorkspaceSeason.seasonId,
      raceDate: {
        lt: now,
      },
    },
    orderBy: { round: 'desc' },
    include: {
      _count: {
        select: {
          predictions: true,
        },
      },
    },
  })
}

// Función para verificar si un GP está bloqueado para predicciones
export async function isGrandPrixLocked(grandPrixId: string): Promise<boolean> {
  const gp = await prisma.grandPrix.findUnique({
    where: { id: grandPrixId },
    select: { qualifyingDate: true },
  })
  
  if (!gp) {
    return true
  }
  
  // El GP se bloquea cuando comienza la clasificación
  return new Date() >= gp.qualifyingDate
}