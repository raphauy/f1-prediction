import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getWorkspaceBySlug } from '@/services/workspace-service'
import { getActiveSeasonForWorkspace } from '@/services/workspace-season-service'
import { getActiveGPForPredictions, getUserGrandPrixWithPredictions } from '@/services/prediction-service'
import { PredictionsListClient } from './predictions-list-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'

interface PredictionsListProps {
  slug: string
}

export async function PredictionsList({ slug }: PredictionsListProps) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) {
    redirect('/w')
  }

  // Obtener temporada activa
  const activeSeason = await getActiveSeasonForWorkspace(workspace.id)
  if (!activeSeason) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              No hay temporada activa
            </CardTitle>
            <CardDescription>
              El juego comenzará cuando se active la temporada 2025
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href={`/w/${slug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Obtener GP activo y GPs con predicciones del usuario
  const activeGP = await getActiveGPForPredictions(activeSeason.seasonId)
  const grandPrixWithPredictions = await getUserGrandPrixWithPredictions(
    session.user.id,
    activeSeason.seasonId
  )

  // Si no hay GP activo ni predicciones pasadas, mostrar mensaje
  if (!activeGP && grandPrixWithPredictions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              No hay predicciones disponibles
            </CardTitle>
            <CardDescription>
              No hay Grand Prix activos y no has hecho predicciones anteriores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href={`/w/${slug}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <PredictionsListClient
      activeGP={activeGP}
      pastGrandPrix={grandPrixWithPredictions}
      workspaceSlug={slug}
    />
  )
}