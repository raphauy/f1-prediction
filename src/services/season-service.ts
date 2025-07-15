import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { } from '@prisma/client'

// Schemas de validación
export const createSeasonSchema = z.object({
  year: z.number().int().min(2025).max(2050),
  name: z.string().min(1).max(100),
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean().default(false),
})

export const updateSeasonSchema = createSeasonSchema.partial()

export type CreateSeasonData = z.infer<typeof createSeasonSchema>
export type UpdateSeasonData = z.infer<typeof updateSeasonSchema>

// Funciones de servicio

export async function getActiveSeason() {
  return await prisma.season.findFirst({
    where: { isActive: true },
  })
}

export async function getAllSeasons() {
  return await prisma.season.findMany({
    orderBy: { year: 'desc' },
    include: {
      _count: {
        select: {
          grandPrix: true,
          workspaceSeasons: true,
        },
      },
    },
  })
}

export async function getSeasonById(id: string) {
  return await prisma.season.findUnique({
    where: { id },
    include: {
      grandPrix: {
        orderBy: { round: 'asc' },
      },
      workspaceSeasons: {
        include: {
          workspace: true,
        },
      },
    },
  })
}

export async function getSeasonByYear(year: number) {
  return await prisma.season.findUnique({
    where: { year },
    include: {
      grandPrix: {
        orderBy: { round: 'asc' },
      },
    },
  })
}

export async function createSeason(data: CreateSeasonData) {
  const validated = createSeasonSchema.parse(data)
  
  // Verificar que no exista una temporada con el mismo año
  const existing = await prisma.season.findUnique({
    where: { year: validated.year },
  })
  
  if (existing) {
    throw new Error(`Ya existe una temporada para el año ${validated.year}`)
  }
  
  // Si se marca como activa, desactivar otras temporadas
  if (validated.isActive) {
    await prisma.season.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })
  }
  
  // Crear la temporada
  const season = await prisma.season.create({
    data: validated,
  })
  
  // Propagar automáticamente a todos los workspaces
  const workspaces = await prisma.workspace.findMany()
  
  if (workspaces.length > 0) {
    await prisma.workspaceSeason.createMany({
      data: workspaces.map(workspace => ({
        workspaceId: workspace.id,
        seasonId: season.id,
        isActive: validated.isActive,
      })),
    })
  }
  
  return season
}

export async function updateSeason(id: string, data: UpdateSeasonData) {
  const validated = updateSeasonSchema.parse(data)
  
  // Si se está actualizando el año, verificar que no exista
  if (validated.year) {
    const existing = await prisma.season.findFirst({
      where: {
        year: validated.year,
        NOT: { id },
      },
    })
    
    if (existing) {
      throw new Error(`Ya existe una temporada para el año ${validated.year}`)
    }
  }
  
  // Si se marca como activa, desactivar otras temporadas
  if (validated.isActive) {
    await prisma.season.updateMany({
      where: {
        isActive: true,
        NOT: { id },
      },
      data: { isActive: false },
    })
    
    // También actualizar WorkspaceSeasons
    await prisma.workspaceSeason.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    })
    
    await prisma.workspaceSeason.updateMany({
      where: { seasonId: id },
      data: { isActive: true },
    })
  }
  
  return await prisma.season.update({
    where: { id },
    data: validated,
  })
}

export async function deleteSeason(id: string) {
  // Las relaciones en cascada se encargarán de eliminar datos relacionados
  return await prisma.season.delete({
    where: { id },
  })
}

// Funciones específicas para WorkspaceSeason

export async function getWorkspaceSeasons(workspaceId: string) {
  return await prisma.workspaceSeason.findMany({
    where: { workspaceId },
    include: {
      season: {
        include: {
          _count: {
            select: {
              grandPrix: true,
            },
          },
        },
      },
      _count: {
        select: {
          standings: true,
        },
      },
    },
    orderBy: {
      season: {
        year: 'desc',
      },
    },
  })
}

export async function toggleWorkspaceSeason(workspaceId: string, seasonId: string, isActive: boolean) {
  // Si se activa, desactivar otras temporadas del workspace
  if (isActive) {
    await prisma.workspaceSeason.updateMany({
      where: {
        workspaceId,
        isActive: true,
      },
      data: { isActive: false },
    })
  }
  
  return await prisma.workspaceSeason.update({
    where: {
      workspaceId_seasonId: {
        workspaceId,
        seasonId,
      },
    },
    data: { isActive },
  })
}

// Función auxiliar para obtener la temporada activa de un workspace
export async function getActiveWorkspaceSeason(workspaceId: string) {
  return await prisma.workspaceSeason.findFirst({
    where: {
      workspaceId,
      isActive: true,
    },
    include: {
      season: {
        include: {
          grandPrix: {
            orderBy: { round: 'asc' },
          },
        },
      },
    },
  })
}