"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, Trophy, TrendingUp, CheckCircle2, Flag } from 'lucide-react'
import { DateTimeDisplay } from '@/components/ui/date-time-display'
import type { GrandPrixWithPredictions } from '@/services/prediction-service'

interface PredictionsListClientProps {
  activeGP: {
    id: string
    name: string
    location: string
    country: string
    circuit: string
    round: number
    qualifyingDate: Date
    raceDate: Date
    isSprint?: boolean
  } | null
  pastGrandPrix: GrandPrixWithPredictions[]
  workspaceSlug: string
}

export function PredictionsListClient({
  activeGP,
  pastGrandPrix,
  workspaceSlug
}: PredictionsListClientProps) {
  // Filtrar GPs con predicciones para el historial
  // Incluir todos los GPs donde el usuario hizo predicciones, excepto el GP activo actual (que está en el otro tab)
  const grandPrixWithPredictions = pastGrandPrix.filter(gp => {
    // Debe tener predicciones del usuario
    if (!gp.hasPredictions) return false

    // Si es el GP activo con deadline aún no pasado, no mostrarlo aquí (está en el tab activo)
    if (activeGP && gp.id === activeGP.id) return false

    // Incluir todos los demás GPs con predicciones (con o sin resultados)
    return true
  })

  // Determinar el tab inicial basado en disponibilidad
  const defaultTab = activeGP ? "active" : "past"

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Predicciones</h1>
          <p className="text-muted-foreground mt-2">
            {activeGP ?
              'Haz tus predicciones para el próximo GP o revisa tus resultados anteriores' :
              'Revisa tus predicciones y resultados de carreras anteriores'
            }
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" disabled={!activeGP}>
              <Clock className="h-4 w-4 mr-2" />
              GP Activo
              {activeGP && (
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
                  Abierto
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past">
              <Trophy className="h-4 w-4 mr-2" />
              Historial
              {grandPrixWithPredictions.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {grandPrixWithPredictions.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Tab GP Activo */}
          <TabsContent value="active" className="mt-6">
            {activeGP ? (
              <Card className="border-green-200 dark:border-green-900">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        {activeGP.name}
                      </CardTitle>
                      <CardDescription>
                        <span className="flex items-center gap-1 mt-2">
                          <Flag className="h-3 w-3" />
                          {activeGP.circuit}, {activeGP.country} • Ronda {activeGP.round}
                        </span>
                      </CardDescription>
                    </div>
                    {activeGP.isSprint && (
                      <Badge variant="secondary" className="bg-yellow-500 text-black">
                        Sprint
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Cierra en:</p>
                        <DateTimeDisplay
                          date={activeGP.qualifyingDate}
                          formatStr="FULL"
                          className="text-xs text-muted-foreground"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Deadline</p>
                      <DateTimeDisplay
                        date={activeGP.qualifyingDate}
                        formatStr="FULL"
                        className="text-sm font-medium"
                      />
                    </div>
                  </div>

                  <Button asChild className="w-full" size="lg">
                    <Link href={`/w/${workspaceSlug}/predictions/${activeGP.id}`}>
                      Hacer Predicciones
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    No hay GP activo
                  </CardTitle>
                  <CardDescription>
                    El próximo Grand Prix aún no ha sido lanzado
                  </CardDescription>
                </CardHeader>
              </Card>
            )}
          </TabsContent>

          {/* Tab Historial */}
          <TabsContent value="past" className="mt-6 space-y-4">
            {grandPrixWithPredictions.length > 0 ? (
              <>
                {/* Resumen de estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">GPs Jugados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{grandPrixWithPredictions.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Predicciones Totales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {grandPrixWithPredictions.reduce((sum, gp) => sum + gp.predictionsCount, 0)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Puntos Totales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {grandPrixWithPredictions.reduce((sum, gp) => sum + gp.totalPoints, 0)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Lista de GPs pasados */}
                {grandPrixWithPredictions.map(gp => (
                  <Card key={gp.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{gp.name}</CardTitle>
                          <CardDescription>
                            <span className="flex items-center gap-1 mt-1">
                              <Flag className="h-3 w-3" />
                              Ronda {gp.round} • {format(new Date(gp.raceDate), "d 'de' MMMM, yyyy", { locale: es })}
                            </span>
                          </CardDescription>
                        </div>
                        {gp.status === 'FINISHED' ? (
                          <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800">
                            Finalizado
                          </Badge>
                        ) : gp.totalPoints > 0 || gp.correctPredictions > 0 ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
                            Con resultados
                          </Badge>
                        ) : new Date() > new Date(gp.qualifyingDate) ? (
                          <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
                            En curso
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            Esperando
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Estadísticas del GP */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-muted-foreground">Predicciones</p>
                          <p className="text-lg font-semibold">{gp.predictionsCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Correctas</p>
                          <div className="flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                              {gp.correctPredictions}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Puntos</p>
                          <div className="flex items-center justify-center gap-1">
                            <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                              {gp.totalPoints}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Barra de progreso de aciertos */}
                      {gp.predictionsCount > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tasa de acierto</span>
                            <span className="font-medium">
                              {Math.round((gp.correctPredictions / gp.predictionsCount) * 100)}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 dark:bg-green-600 transition-all duration-300"
                              style={{ width: `${(gp.correctPredictions / gp.predictionsCount) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/w/${workspaceSlug}/predictions/${gp.id}`}>
                          Ver Resultados Detallados
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Sin historial de predicciones
                  </CardTitle>
                  <CardDescription>
                    Aún no has hecho predicciones en Grand Prix anteriores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activeGP && (
                    <Button asChild variant="outline">
                      <Link href={`/w/${workspaceSlug}/predictions/${activeGP.id}`}>
                        Hacer tu primera predicción
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}