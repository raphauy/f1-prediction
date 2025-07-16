import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, TrendingUp } from "lucide-react"
import Link from "next/link"

interface GlobalStanding {
  userId: string
  user: {
    id: string
    name: string | null
    email: string
  }
  bestPoints: number
  bestWorkspace: {
    name: string
    slug: string
  }
  totalWorkspaces: number
}

interface GlobalStandingsPreviewProps {
  standings: GlobalStanding[] | null
  currentUserId: string
}

export function GlobalStandingsPreview({ standings, currentUserId }: GlobalStandingsPreviewProps) {
  if (!standings || standings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5" />
            <span>Top 5 Global</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p>No hay clasificación global disponible</p>
            <p className="text-sm">
              La tabla se actualizará cuando haya competidores
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
          <Globe className="h-5 w-5" />
          <span>Top 5 Global</span>
        </CardTitle>
        <Link 
          href="/standings"
          className="text-sm text-primary hover:text-primary/80"
        >
          Ver tabla completa →
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {standings.map((standing, index) => (
            <div 
              key={standing.userId}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                standing.userId === currentUserId 
                  ? 'bg-primary/5 border-primary/20' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {standing.user.name || standing.user.email.split("@")[0]}
                    {standing.userId === currentUserId && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Tú
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {standing.totalWorkspaces} {standing.totalWorkspaces === 1 ? 'juego' : 'juegos'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-bold text-lg">{standing.bestPoints}</span>
                <span className="text-sm text-muted-foreground">pts</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}