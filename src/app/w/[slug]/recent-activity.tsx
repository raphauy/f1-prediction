import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Trophy, Target, CheckCircle, UserPlus } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ActivityData {
  id: string
  type: string
  user: string
  description: string
  time: Date
  metadata?: Record<string, unknown> | null
  icon: string
  color: string
}

interface RecentActivityProps {
  activities: ActivityData[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  // Mapeo de iconos string a componentes
  const iconMap: Record<string, React.FC<{ className?: string }>> = {
    Target,
    Trophy,
    CheckCircle,
    UserPlus,
    Activity
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Actividad Reciente</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = iconMap[activity.icon] || Activity
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`mt-0.5 ${activity.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(activity.time), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p>No hay actividad reciente</p>
            <p className="text-sm">
              Las predicciones y puntos aparecerán aquí
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}