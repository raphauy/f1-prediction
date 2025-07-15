import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, Target } from "lucide-react"

interface WorkspaceStatsCardProps {
  stats?: {
    totalUsers: number
    totalPredictions: number
    averagePoints: number
  } | null
}

export function WorkspaceStatsCard({ stats }: WorkspaceStatsCardProps) {
  if (!stats) {
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Estadísticas del Juego
        </CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Competidores activos</span>
            </div>
            <span className="font-bold">{stats.totalUsers}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Total predicciones</span>
            </div>
            <span className="font-bold">{stats.totalPredictions}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Promedio de puntos</span>
            </div>
            <span className="font-bold">{stats.averagePoints}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}