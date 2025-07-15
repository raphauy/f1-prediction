import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Trophy } from "lucide-react"

interface UserStatusCardProps {
  userPosition: number | null
  userPoints?: number
  totalCompetitors?: number
}

export function UserStatusCard({ userPosition, userPoints = 0, totalCompetitors = 0 }: UserStatusCardProps) {
  const getPositionBadge = (position: number) => {
    if (position === 1) return { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100", label: "Líder" }
    if (position === 2) return { color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100", label: "2do Lugar" }
    if (position === 3) return { color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100", label: "3er Lugar" }
    if (position <= 5) return { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100", label: "Top 5" }
    return null
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Mi Posición
        </CardTitle>
        <User className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {userPosition ? (
          <>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">#{userPosition}</span>
              <span className="text-sm text-muted-foreground">de {totalCompetitors}</span>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{userPoints} puntos</span>
            </div>
            {userPosition <= 5 && (
              <Badge 
                variant="secondary" 
                className={`mt-2 ${getPositionBadge(userPosition)?.color}`}
              >
                {getPositionBadge(userPosition)?.label}
              </Badge>
            )}
          </>
        ) : (
          <div className="space-y-2">
            <p className="text-lg font-medium text-muted-foreground">Sin posición</p>
            <p className="text-xs text-muted-foreground">
              Realiza tu primera predicción para entrar en la clasificación
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}