"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

import type { UserPerformanceStats } from "@/services/statistics-service"

interface UserStatsRowProps {
  stats: UserPerformanceStats | null
  loading: boolean
}

export function UserStatsRow({ stats, loading }: UserStatsRowProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <tr>
      <td colSpan={5} className="p-4 bg-muted/30">
        {loading ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
              Cargando estadísticas...
            </div>
          </div>
        ) : stats ? (
          <div className="space-y-4">
            {/* Resumen general */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Precisión</p>
                      <p className="text-2xl font-bold">
                        {stats.accuracyRate.toFixed(1)}%
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <Progress 
                    value={stats.accuracyRate} 
                    className="mt-2 h-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Forma Reciente</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getTrendIcon(stats.recentForm.trend)}
                        <span className="text-sm font-medium">
                          {stats.recentForm.lastFiveGPs.reduce((a: number, b: number) => a + b, 0)} pts
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {stats.recentForm.lastFiveGPs.map((points: number, idx: number) => (
                        <div
                          key={idx}
                          className={cn(
                            "w-8 h-8 rounded flex items-center justify-center text-xs font-medium",
                            points > 10 ? "bg-green-500/20 text-green-700 dark:text-green-400" :
                            points > 5 ? "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" :
                            "bg-red-500/20 text-red-700 dark:text-red-400"
                          )}
                        >
                          {points}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">Por Categoría</p>
                  <div className="space-y-2">
                    {stats.pointsByCategory.map((cat) => (
                      <div key={cat.category} className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {cat.category}
                        </Badge>
                        <span className="text-xs font-medium">
                          {cat.points} pts ({cat.accuracy.toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Últimos GPs */}
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm font-medium mb-3">Rendimiento por Gran Premio</p>
                <div className="space-y-2">
                  {stats.pointsByGP.slice(-5).reverse().map((gp) => (
                    <div key={gp.grandPrixId} className="flex items-center justify-between">
                      <span className="text-sm">{gp.grandPrixName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {gp.predictions} predicciones
                        </span>
                        <Badge variant={gp.points > 10 ? "default" : "secondary"}>
                          {gp.points} pts
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Error al cargar estadísticas
          </div>
        )}
      </td>
    </tr>
  )
}