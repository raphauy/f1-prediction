'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Play, Users } from 'lucide-react'
import { toast } from 'sonner'
import { processGrandPrixAction, getScoringStatusAction } from './actions'

interface WorkspaceSeason {
  id: string
  workspace: {
    id: string
    name: string
    slug: string
  }
  season: {
    id: string
    name: string
    year: number
  }
  _count: {
    standings: number
  }
}

interface ScoringDashboardClientProps {
  workspaceSeasons: WorkspaceSeason[]
}

export function ScoringDashboardClient({ workspaceSeasons }: ScoringDashboardClientProps) {
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null)
  const [scoringStatus, setScoringStatus] = useState<{
    seasonName: string
    readyToProcess: Array<{
      id: string
      name: string
      round: number
      totalQuestions: number
      totalResults: number
    }>
    grandPrixStatus: Array<{
      id: string
      name: string
      round: number
      hasPredictions: boolean
      hasCompleteResults: boolean
      totalQuestions: number
      totalResults: number
    }>
  } | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const loadScoringStatus = async (workspaceSeasonId: string) => {
    setIsLoadingStatus(true)
    try {
      const status = await getScoringStatusAction(workspaceSeasonId)
      setScoringStatus(status)
      setSelectedWorkspace(workspaceSeasonId)
    } catch {
      toast.error('Error al cargar el estado de puntuación')
    } finally {
      setIsLoadingStatus(false)
    }
  }

  const processGrandPrix = async (grandPrixId: string) => {
    if (!selectedWorkspace) return
    
    setIsProcessing(true)
    try {
      const result = await processGrandPrixAction(grandPrixId, selectedWorkspace)
      toast.success(
        `Puntuación procesada: ${result.processedUsers} usuarios, ${result.totalPointsAwarded} puntos totales`
      )
      // Recargar estado
      await loadScoringStatus(selectedWorkspace)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar puntuación')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Selector de Workspace */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Workspace</CardTitle>
          <CardDescription>
            Elige un workspace para ver y procesar su puntuación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {workspaceSeasons.map((ws) => (
              <button
                key={ws.id}
                onClick={() => loadScoringStatus(ws.id)}
                className={`p-4 text-left rounded-lg border transition-colors ${
                  selectedWorkspace === ws.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <div className="font-medium">{ws.workspace.name}</div>
                <div className="text-sm text-muted-foreground">
                  {ws.season.name}
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Users className="h-3 w-3" />
                  <span>{ws._count.standings} participantes</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estado de Puntuación */}
      {scoringStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Estado de Puntuación</CardTitle>
            <CardDescription>
              Grand Prix listos para procesar en {scoringStatus.seasonName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStatus ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {scoringStatus.readyToProcess.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hay Grand Prix listos para procesar
                  </p>
                ) : (
                  scoringStatus.readyToProcess.map((gp) => (
                    <div
                      key={gp.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <div className="font-medium">
                          Ronda {gp.round}: {gp.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {gp.totalQuestions} preguntas, {gp.totalResults} resultados oficiales
                        </div>
                      </div>
                      <Button
                        onClick={() => processGrandPrix(gp.id)}
                        disabled={isProcessing}
                        size="sm"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                        <span className="ml-2">Procesar</span>
                      </Button>
                    </div>
                  ))
                )}

                {/* Grand Prix sin resultados completos */}
                {scoringStatus.grandPrixStatus
                  .filter((gp) => gp.hasPredictions && !gp.hasCompleteResults)
                  .map((gp) => (
                    <div
                      key={gp.id}
                      className="flex items-center justify-between p-4 rounded-lg border opacity-60"
                    >
                      <div>
                        <div className="font-medium">
                          Ronda {gp.round}: {gp.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Faltan resultados: {gp.totalResults}/{gp.totalQuestions}
                        </div>
                      </div>
                      <Badge variant="secondary">Incompleto</Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}