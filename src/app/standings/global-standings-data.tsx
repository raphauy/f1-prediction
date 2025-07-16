import { getGlobalStandings } from "@/services/global-standings-service"
import { GlobalStandingsWrapper } from "./global-standings-wrapper"

interface GlobalStandingsDataProps {
  searchParams: {
    page?: string
    search?: string
    sort?: string
    minGames?: string
  }
}

const ITEMS_PER_PAGE = 25

export async function GlobalStandingsData({ searchParams }: GlobalStandingsDataProps) {
  const page = Number(searchParams.page) || 1
  const search = searchParams.search || ""
  const minGames = searchParams.minGames || "all"
  
  // Calcular offset para paginación
  const offset = (page - 1) * ITEMS_PER_PAGE

  // Obtener datos con filtros
  const { standings, total } = await getGlobalStandings({
    limit: ITEMS_PER_PAGE,
    offset,
    search,
  })

  // Filtrar por cantidad mínima de juegos si es necesario
  let filteredStandings = standings
  let filteredTotal = total
  
  if (minGames !== "all") {
    const minGamesNum = parseInt(minGames)
    filteredStandings = standings.filter(s => s.totalWorkspaces >= minGamesNum)
    // Esto es una aproximación, idealmente el filtro debería hacerse en el servicio
    filteredTotal = Math.floor(total * (filteredStandings.length / standings.length))
  }

  // Ordenar según el criterio seleccionado
  if (searchParams.sort === "games") {
    filteredStandings.sort((a, b) => b.totalWorkspaces - a.totalWorkspaces)
  } else if (searchParams.sort === "name") {
    filteredStandings.sort((a, b) => {
      const nameA = a.user.name || a.user.email
      const nameB = b.user.name || b.user.email
      return nameA.localeCompare(nameB)
    })
  }
  // Por defecto ya viene ordenado por puntos

  // Calcular estadísticas
  const totalWorkspaces = new Set(
    standings.flatMap(s => s.workspaces.map(w => w.id))
  ).size

  return (
    <GlobalStandingsWrapper
      initialData={{
        standings: filteredStandings,
        total: filteredTotal,
        stats: {
          totalCompetitors: total,
          totalWorkspaces,
        }
      }}
      itemsPerPage={ITEMS_PER_PAGE}
    />
  )
}