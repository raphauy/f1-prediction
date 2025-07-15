import { prisma } from "@/lib/prisma"
import { WorkspaceSeason, Season, GrandPrix } from "@prisma/client"

export type WorkspaceSeasonWithSeason = WorkspaceSeason & {
  season: Season
}

export type WorkspaceSeasonWithDetails = WorkspaceSeason & {
  season: Season & {
    grandPrix: GrandPrix[]
  }
  _count: {
    predictions: number
    standings: number
  }
}

/**
 * Obtiene la temporada activa para un workspace
 * Por ahora retorna la temporada más reciente disponible
 */
export async function getActiveSeasonForWorkspace(workspaceId: string): Promise<WorkspaceSeasonWithSeason | null> {
  return await prisma.workspaceSeason.findFirst({
    where: { 
      workspaceId,
      season: {
        isActive: true
      }
    },
    include: {
      season: true
    },
    orderBy: {
      season: {
        year: 'desc'
      }
    }
  })
}

/**
 * Obtiene todas las temporadas de un workspace
 */
export async function getWorkspaceSeasons(workspaceId: string): Promise<WorkspaceSeasonWithSeason[]> {
  return await prisma.workspaceSeason.findMany({
    where: { workspaceId },
    include: {
      season: true
    },
    orderBy: {
      season: {
        year: 'desc'
      }
    }
  })
}

/**
 * Obtiene una temporada específica de un workspace con detalles
 */
export async function getWorkspaceSeasonWithDetails(
  workspaceId: string, 
  seasonId: string
): Promise<WorkspaceSeasonWithDetails | null> {
  return await prisma.workspaceSeason.findUnique({
    where: {
      workspaceId_seasonId: {
        workspaceId,
        seasonId
      }
    },
    include: {
      season: {
        include: {
          grandPrix: {
            orderBy: {
              round: 'asc'
            }
          }
        }
      },
      _count: {
        select: {
          predictions: true,
          standings: true
        }
      }
    }
  })
}

/**
 * Obtiene el próximo Grand Prix con deadline abierto
 */
export async function getNextGrandPrixForWorkspace(workspaceId: string): Promise<GrandPrix | null> {
  const activeSeason = await getActiveSeasonForWorkspace(workspaceId)
  if (!activeSeason) return null

  const now = new Date()
  
  return await prisma.grandPrix.findFirst({
    where: {
      seasonId: activeSeason.seasonId,
      qualifyingDate: {
        gt: now
      }
    },
    orderBy: {
      qualifyingDate: 'asc'
    }
  })
}

/**
 * Obtiene el último Grand Prix con resultados
 */
export async function getLastGrandPrixWithResults(workspaceId: string): Promise<GrandPrix | null> {
  const activeSeason = await getActiveSeasonForWorkspace(workspaceId)
  if (!activeSeason) return null

  const now = new Date()
  
  return await prisma.grandPrix.findFirst({
    where: {
      seasonId: activeSeason.seasonId,
      raceDate: {
        lt: now
      }
    },
    orderBy: {
      raceDate: 'desc'
    }
  })
}