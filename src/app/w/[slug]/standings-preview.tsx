import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp } from "lucide-react"
import Link from "next/link"
import { StandingWithUser } from "@/services/standings-service"

interface StandingsPreviewProps {
  standings: StandingWithUser[] | null
  currentUserId: string
  workspaceSlug: string
}

export function StandingsPreview({ standings, currentUserId, workspaceSlug }: StandingsPreviewProps) {
  if (!standings || standings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Clasificación</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p>No hay clasificación disponible</p>
            <p className="text-sm">
              La tabla se actualizará cuando se realicen predicciones
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5" />
          <span>Top 5 Clasificación</span>
        </CardTitle>
        <Link 
          href={`/w/${workspaceSlug}/standings`}
          className="text-sm text-primary hover:text-primary/80"
        >
          Ver tabla completa →
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {standings.map((standing) => (
            <div 
              key={standing.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                standing.userId === currentUserId 
                  ? 'bg-primary/5 border-primary/20' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold">
                  {standing.position}
                </div>
                <div>
                  <p className="font-medium">
                    {standing.user.name || standing.user.email}
                    {standing.userId === currentUserId && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Tú
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {standing.predictionsCount} predicciones
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-bold text-lg">{standing.totalPoints}</span>
                <span className="text-sm text-muted-foreground">pts</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}