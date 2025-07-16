import { z } from "zod"
import { prisma } from "@/lib/prisma"

// Schema para filtros de standings globales
export const globalStandingsFilterSchema = z.object({
  seasonId: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
})

export type GlobalStandingsFilter = z.infer<typeof globalStandingsFilterSchema>

// Tipo para standings globales con información agregada
export interface GlobalStanding {
  userId: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
  bestPoints: number
  bestWorkspace: {
    id: string
    name: string
    slug: string
  }
  totalWorkspaces: number
  workspaces: {
    id: string
    name: string
    slug: string
    points: number
    position: number | null
  }[]
  globalPosition?: number
}

// Obtener standings globales (mejor puntaje de cada usuario)
export async function getGlobalStandings(
  filter: Partial<GlobalStandingsFilter> = {}
): Promise<{
  standings: GlobalStanding[]
  total: number
}> {
  const { seasonId, limit, offset, search } = globalStandingsFilterSchema.parse(filter)

  // Obtener la temporada activa si no se especifica
  const targetSeasonId = seasonId || await getActiveSeasonId()
  if (!targetSeasonId) {
    return { standings: [], total: 0 }
  }

  // Query base para obtener usuarios y sus standings
  const whereClause = {
    workspaceSeason: {
      seasonId: targetSeasonId,
      isActive: true,
    },
    ...(search && {
      user: {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      },
    }),
  }

  // Obtener total de usuarios únicos
  const totalUsers = await prisma.seasonStanding.findMany({
    where: whereClause,
    select: { userId: true },
    distinct: ["userId"],
  })

  // Obtener standings agrupados por usuario
  const standings = await prisma.seasonStanding.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      workspaceSeason: {
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
    orderBy: [
      { totalPoints: "desc" },
      { predictionsCount: "desc" },
    ],
  })

  // Agrupar por usuario y calcular mejores puntajes
  const userStandingsMap = new Map<string, GlobalStanding>()

  for (const standing of standings) {
    const userId = standing.userId
    const existing = userStandingsMap.get(userId)

    const workspaceInfo = {
      id: standing.workspaceSeason.workspace.id,
      name: standing.workspaceSeason.workspace.name,
      slug: standing.workspaceSeason.workspace.slug,
      points: standing.totalPoints,
      position: standing.position,
    }

    if (!existing || standing.totalPoints > existing.bestPoints) {
      userStandingsMap.set(userId, {
        userId,
        user: standing.user,
        bestPoints: standing.totalPoints,
        bestWorkspace: {
          id: workspaceInfo.id,
          name: workspaceInfo.name,
          slug: workspaceInfo.slug,
        },
        totalWorkspaces: 1,
        workspaces: [workspaceInfo],
      })
    } else {
      existing.workspaces.push(workspaceInfo)
      existing.totalWorkspaces = existing.workspaces.length
    }
  }

  // Convertir a array y ordenar por mejores puntos
  const globalStandings = Array.from(userStandingsMap.values())
    .sort((a, b) => b.bestPoints - a.bestPoints)

  // Asignar posiciones globales
  globalStandings.forEach((standing, index) => {
    standing.globalPosition = index + 1
  })

  // Aplicar paginación
  const paginatedStandings = globalStandings.slice(offset, offset + limit)

  return {
    standings: paginatedStandings,
    total: totalUsers.length,
  }
}

// Obtener estadísticas de un usuario en todos sus workspaces
export async function getUserMultiWorkspaceStats(userId: string) {
  const activeSeasonId = await getActiveSeasonId()
  if (!activeSeasonId) {
    return null
  }

  const standings = await prisma.seasonStanding.findMany({
    where: {
      userId,
      workspaceSeason: {
        seasonId: activeSeasonId,
        isActive: true,
      },
    },
    include: {
      workspaceSeason: {
        include: {
          workspace: true,
        },
      },
    },
    orderBy: {
      totalPoints: "desc",
    },
  })

  if (standings.length === 0) {
    return null
  }

  const bestStanding = standings[0]
  const totalPredictions = standings.reduce((sum, s) => sum + s.predictionsCount, 0)
  const averagePoints = standings.reduce((sum, s) => sum + s.totalPoints, 0) / standings.length

  return {
    userId,
    totalWorkspaces: standings.length,
    bestPoints: bestStanding.totalPoints,
    bestWorkspace: bestStanding.workspaceSeason.workspace,
    averagePoints: Math.round(averagePoints),
    totalPredictions,
    workspaces: standings.map(s => ({
      workspace: s.workspaceSeason.workspace,
      points: s.totalPoints,
      position: s.position,
      predictionsCount: s.predictionsCount,
    })),
  }
}

// Comparar múltiples usuarios
export async function compareUsers(userIds: string[]) {
  if (userIds.length < 2 || userIds.length > 4) {
    throw new Error("Se pueden comparar entre 2 y 4 usuarios")
  }

  const activeSeasonId = await getActiveSeasonId()
  if (!activeSeasonId) {
    return null
  }

  const usersData = await Promise.all(
    userIds.map(userId => getUserMultiWorkspaceStats(userId))
  )

  // Obtener GPs con resultados para comparación detallada
  const grandPrixWithResults = await prisma.grandPrix.findMany({
    where: {
      seasonId: activeSeasonId,
      officialResults: {
        some: {},
      },
    },
    include: {
      predictions: {
        where: {
          userId: { in: userIds },
        },
        include: {
          earnedPoints: true,
          gpQuestion: true,
        },
      },
    },
    orderBy: {
      round: "asc",
    },
  })

  return {
    users: usersData.filter(Boolean),
    grandPrixComparison: grandPrixWithResults.map(gp => ({
      grandPrix: {
        id: gp.id,
        name: gp.name,
        round: gp.round,
      },
      userPoints: userIds.map(userId => {
        const userPredictions = gp.predictions.filter(p => p.userId === userId)
        const totalPoints = userPredictions.reduce((sum, p) => 
          sum + (p.earnedPoints[0]?.points || 0), 0
        )
        return {
          userId,
          points: totalPoints,
          predictionsCount: userPredictions.length,
        }
      }),
    })),
  }
}

// Helper: Obtener ID de temporada activa
async function getActiveSeasonId(): Promise<string | null> {
  const activeSeason = await prisma.season.findFirst({
    where: { isActive: true },
    select: { id: true },
  })
  return activeSeason?.id || null
}