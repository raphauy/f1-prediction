import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Clock } from 'lucide-react'
import { getTimeUntilDeadline } from '@/lib/deadline-utils'
import type { GrandPrixWithDetails } from '@/services/grand-prix-service'
import Link from 'next/link'

interface UpcomingDeadlinesBannerProps {
  grandPrix: GrandPrixWithDetails[]
}

export function UpcomingDeadlinesBanner({ grandPrix }: UpcomingDeadlinesBannerProps) {
  // Filtrar GPs con deadlines en las próximas 48 horas
  const upcomingDeadlines = grandPrix
    .filter(gp => {
      const { urgency } = getTimeUntilDeadline(new Date(gp.qualifyingDate))
      return urgency === 'critical' || urgency === 'warning'
    })
    .sort((a, b) => new Date(a.qualifyingDate).getTime() - new Date(b.qualifyingDate).getTime())
    .slice(0, 3) // Mostrar máximo 3
  
  if (upcomingDeadlines.length === 0) {
    return null
  }
  
  return (
    <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-200">
        Grand Prix con deadlines próximos
      </AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-2">
          {upcomingDeadlines.map(gp => {
            const { timeRemaining } = getTimeUntilDeadline(new Date(gp.qualifyingDate))
            return (
              <div key={gp.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium">{gp.name}</span>
                  <span className="text-sm text-muted-foreground">
                    - Cierra en {timeRemaining}
                  </span>
                </div>
                <Link 
                  href={`/admin/grand-prix/${gp.id}/edit`}
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  Gestionar
                </Link>
              </div>
            )
          })}
        </div>
      </AlertDescription>
    </Alert>
  )
}