"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Globe, Search, Trophy, Users } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

interface GlobalStanding {
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
  globalPosition?: number
}

interface GlobalStandingsWrapperProps {
  initialData: {
    standings: GlobalStanding[]
    total: number
    stats: {
      totalCompetitors: number
      totalWorkspaces: number
    }
  }
  itemsPerPage?: number
}

export function GlobalStandingsWrapper({ 
  initialData, 
  itemsPerPage = 25 
}: GlobalStandingsWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Estado de filtros y paginación
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "points")
  const [minGames, setMinGames] = useState(searchParams.get("minGames") || "all")
  
  const currentPage = Number(searchParams.get("page")) || 1
  const totalPages = Math.ceil(initialData.total / itemsPerPage)

  // Actualizar URL con nuevos parámetros
  const updateFilters = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    // Reset a página 1 cuando cambian los filtros
    if (!newParams.page) {
      params.set("page", "1")
    }
    
    router.push(`/standings?${params.toString()}`)
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    // Debounce la búsqueda
    const timeoutId = setTimeout(() => {
      updateFilters({ search: value })
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }

  const handlePageChange = (page: number) => {
    updateFilters({ page: page.toString() })
  }

  return (
    <div className="space-y-4">
      {/* Estadísticas globales */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Total Competidores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialData.stats.totalCompetitors}</div>
            <p className="text-xs text-muted-foreground">En todos los juegos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Líder Global</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {initialData.standings[0]?.user.name || initialData.standings[0]?.user.email.split("@")[0] || "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {initialData.standings[0]?.bestPoints || 0} puntos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Juegos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{initialData.stats.totalWorkspaces}</div>
            <p className="text-xs text-muted-foreground">Workspaces con actividad</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar competidor..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filtro por cantidad de juegos */}
            <Select 
              value={minGames} 
              onValueChange={(value) => {
                setMinGames(value)
                updateFilters({ minGames: value })
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por juegos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los competidores</SelectItem>
                <SelectItem value="1">Al menos 1 juego</SelectItem>
                <SelectItem value="2">2+ juegos</SelectItem>
                <SelectItem value="3">3+ juegos</SelectItem>
                <SelectItem value="5">5+ juegos</SelectItem>
              </SelectContent>
            </Select>

            {/* Ordenar por */}
            <Select 
              value={sortBy} 
              onValueChange={(value) => {
                setSortBy(value)
                updateFilters({ sort: value })
              }}
            >
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="points">Puntos</SelectItem>
                <SelectItem value="games">Cantidad juegos</SelectItem>
                <SelectItem value="name">Nombre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla global */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Clasificación Global
          </CardTitle>
          <CardDescription>
            Mejor puntuación de cada competidor entre todos sus juegos
            {searchTerm && ` • Buscando "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">Pos.</TableHead>
                  <TableHead>Competidor</TableHead>
                  <TableHead className="hidden sm:table-cell">Mejor Juego</TableHead>
                  <TableHead className="text-center w-16">
                    <Users className="h-4 w-4 mx-auto" />
                    <span className="sr-only">Juegos</span>
                  </TableHead>
                  <TableHead className="text-right w-20">Puntos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialData.standings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground sm:hidden">
                      No se encontraron competidores con los filtros aplicados
                    </TableCell>
                    <TableCell colSpan={5} className="hidden sm:table-cell text-center py-8 text-muted-foreground">
                      No se encontraron competidores con los filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  initialData.standings.map((standing) => {
                    const position = ((currentPage - 1) * itemsPerPage) + (standing.globalPosition || 0)
                    
                    return (
                      <TableRow key={standing.userId}>
                        <TableCell className="text-center font-mono">
                          <div className="flex items-center justify-center gap-1">
                            {position === 1 && (
                              <Trophy className="h-4 w-4 text-yellow-500" />
                            )}
                            {position === 2 && (
                              <Trophy className="h-4 w-4 text-gray-400" />
                            )}
                            {position === 3 && (
                              <Trophy className="h-4 w-4 text-orange-600" />
                            )}
                            <span>{position}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">
                            {standing.user.name || standing.user.email.split("@")[0]}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Link 
                            href={`/w/${standing.bestWorkspace.slug}`}
                            className="hover:underline text-sm truncate block max-w-[150px]"
                          >
                            {standing.bestWorkspace.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">
                            {standing.totalWorkspaces}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {standing.bestPoints}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, initialData.total)} de {initialData.total}
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="px-2 sm:px-4"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>
                
                <div className="flex items-center gap-1">
                  {/* Mostrar máximo 5 páginas */}
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum = i + 1
                    
                    // Lógica para mostrar páginas alrededor de la actual
                    if (totalPages > 5) {
                      if (currentPage > 3) {
                        pageNum = currentPage - 2 + i
                      }
                      if (currentPage > totalPages - 3) {
                        pageNum = totalPages - 4 + i
                      }
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-10"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-2 sm:px-4"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}