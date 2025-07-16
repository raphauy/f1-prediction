"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StandingsClient } from "./standings-client"
import { StandingsTableClient } from "./standings-table-client"
import { Users, Globe } from "lucide-react"
import Link from "next/link"

interface Standing {
  id: string
  position: number | null
  totalPoints: number
  predictionsCount: number
  trend: number
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface StandingsWrapperProps {
  standings: Standing[]
  currentUserId: string
  workspaceSlug: string
  workspaceSeasonId: string
}

export function StandingsWrapper({ 
  standings, 
  currentUserId, 
  workspaceSlug, 
  workspaceSeasonId 
}: StandingsWrapperProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")

  // Filtrar standings basado en búsqueda y filtro
  const filteredStandings = useMemo(() => {
    let filtered = standings

    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(standing => {
        const name = standing.user.name || standing.user.email.split("@")[0]
        return name.toLowerCase().includes(searchTerm.toLowerCase())
      })
    }

    // Aplicar filtro
    switch (filterBy) {
      case "active":
        filtered = filtered.filter(standing => standing.predictionsCount > 0)
        break
      case "inactive":
        filtered = filtered.filter(standing => standing.predictionsCount === 0)
        break
      // "all" no necesita filtro
    }

    // Re-calcular posiciones después de filtrar
    return filtered.map((standing, index) => ({
      ...standing,
      position: index + 1
    }))
  }, [standings, searchTerm, filterBy])

  return (
    <div className="space-y-4">
      <StandingsClient 
        workspaceSlug={workspaceSlug}
        onSearchChange={setSearchTerm}
        onFilterChange={setFilterBy}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clasificación del Juego
                {(searchTerm || filterBy !== "all") && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({filteredStandings.length} de {standings.length} competidores)
                  </span>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Ranking dentro de este workspace
              </p>
            </div>
            <Link 
              href="/standings" 
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <Globe className="h-4 w-4" />
              Ver Clasificación Global
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStandings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron competidores con los filtros aplicados
            </div>
          ) : (
            <StandingsTableClient 
              standings={filteredStandings}
              currentUserId={currentUserId}
              workspaceSlug={workspaceSlug}
              workspaceSeasonId={workspaceSeasonId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}