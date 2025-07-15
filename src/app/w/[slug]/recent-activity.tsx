import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Trophy, Target, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface RecentActivityProps {
  lastGP?: {
    name: string
    raceDate: Date
  } | null
}

export function RecentActivity({ lastGP }: RecentActivityProps) {
  // Por ahora mostraremos actividad simulada
  // En el futuro, esto vendrá de la base de datos
  const mockActivities = lastGP ? [
    {
      id: 1,
      type: "prediction",
      user: "Carlos M.",
      action: "realizó predicciones",
      gp: lastGP.name,
      time: new Date(Date.now() - 2 * 60 * 60 * 1000), // Hace 2 horas
      icon: Target,
      color: "text-blue-500"
    },
    {
      id: 2,
      type: "points",
      user: "Ana G.",
      action: "ganó 45 puntos",
      gp: "GP anterior",
      time: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hace 1 día
      icon: Trophy,
      color: "text-yellow-500"
    },
    {
      id: 3,
      type: "prediction",
      user: "Miguel R.",
      action: "realizó predicciones",
      gp: lastGP.name,
      time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Hace 3 días
      icon: CheckCircle,
      color: "text-green-500"
    }
  ] : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Actividad Reciente</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mockActivities.length > 0 ? (
          <div className="space-y-4">
            {mockActivities.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`mt-0.5 ${activity.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{" "}
                      {activity.action} para el{" "}
                      <span className="font-medium">{activity.gp}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(activity.time, "d 'de' MMMM 'a las' HH:mm", { locale: es })}
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