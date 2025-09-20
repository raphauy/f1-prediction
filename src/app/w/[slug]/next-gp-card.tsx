"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Flag, CheckCircle, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { format, differenceInHours } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

interface NextGPCardProps {
  grandPrix: {
    id: string
    name: string
    location: string
    country: string
    circuit: string
    qualifyingDate: Date
    raceDate: Date
    round: number
    isSprint: boolean
    launchedAt?: Date | null
  } | null
  isGPActive: boolean
  hasUserPredicted: boolean
  userPredictionInfo?: {
    hasUserPredicted: boolean
    predictionCount: number
    totalQuestions: number
  }
  workspaceSlug: string
}

export function NextGPCard({ grandPrix, isGPActive, hasUserPredicted, userPredictionInfo, workspaceSlug }: NextGPCardProps) {
  const [timeLeft, setTimeLeft] = useState<string>("")

  useEffect(() => {
    if (!grandPrix) return

    const updateCountdown = () => {
      const now = new Date()
      const deadline = new Date(grandPrix.qualifyingDate)
      const difference = deadline.getTime() - now.getTime()

      if (difference <= 0) {
        setTimeLeft("Deadline pasado")
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else {
        setTimeLeft(`${hours}h ${minutes}m`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // Actualizar cada minuto

    return () => clearInterval(interval)
  }, [grandPrix])

  if (!grandPrix) {
    return (
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">No hay próximo GP</h2>
          <p className="text-muted-foreground">
            La temporada ha finalizado o aún no hay GPs programados
          </p>
        </div>
      </div>
    )
  }

  const isDeadlinePassed = new Date() > new Date(grandPrix.qualifyingDate)
  
  // Verificar si el GP fue lanzado recientemente (últimas 48 horas)
  const isNewlyLaunched = grandPrix.launchedAt && 
    differenceInHours(new Date(), new Date(grandPrix.launchedAt)) < 48

  return (
    <div className="rounded-lg overflow-hidden shadow-sm relative">
      {/* Badge de nuevo GP */}
      {isNewlyLaunched && !hasUserPredicted && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 animate-pulse shadow-lg">
            <Sparkles className="h-3 w-3 mr-1" />
            ¡Nuevo!
          </Badge>
        </div>
      )}
      
      {/* Header compacto con fondo rojo */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <Flag className="h-5 w-5" />
                <span>{grandPrix.name}</span>
              </h2>
              {grandPrix.isSprint && (
                <Badge variant="secondary" className="bg-yellow-500 text-black border-0">
                  Sprint
                </Badge>
              )}
              <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
                Ronda {grandPrix.round}
              </Badge>
            </div>
            <p className="text-sm opacity-90">
              {grandPrix.circuit}, {grandPrix.country}
            </p>
          </div>
        </div>
      </div>

      {/* Contenido inferior compacto */}
      <div className="p-4 bg-card border border-t-0">
        {!isDeadlinePassed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Clock className="h-6 w-6 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{timeLeft}</p>
                <p className="text-xs text-muted-foreground">hasta el cierre</p>
              </div>
            </div>
            {!isGPActive ? (
              <Badge variant="secondary" className="px-4 py-2">
                <span className="font-medium">No hay GP activo</span>
              </Badge>
            ) : hasUserPredicted ? (
              <div className="flex items-center gap-2">
                {userPredictionInfo && userPredictionInfo.predictionCount === userPredictionInfo.totalQuestions ? (
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-4 py-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">
                      Predicciones: {userPredictionInfo.predictionCount}/{userPredictionInfo.totalQuestions}
                    </span>
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 px-4 py-2">
                    <span className="font-medium">
                      Predicciones: {userPredictionInfo?.predictionCount || 0}/{userPredictionInfo?.totalQuestions || 0}
                    </span>
                  </Badge>
                )}
                {userPredictionInfo && userPredictionInfo.predictionCount < userPredictionInfo.totalQuestions && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/w/${workspaceSlug}/predictions`}>
                      Completar
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <Button asChild size="lg">
                <Link href={`/w/${workspaceSlug}/predictions`}>
                  Hacer Predicción
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-sm">
                Predicciones cerradas
              </Badge>
              {hasUserPredicted ? (
                <span className="text-sm text-muted-foreground">
                  · {userPredictionInfo?.predictionCount || 0} predicciones realizadas
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  · No participaste
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                Carrera: {format(new Date(grandPrix.raceDate), "d 'de' MMMM", { locale: es })}
              </div>
              {hasUserPredicted && (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/w/${workspaceSlug}/predictions/${grandPrix.id}`}>
                    Ver mis predicciones
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}