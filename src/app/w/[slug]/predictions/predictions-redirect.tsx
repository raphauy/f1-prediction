import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getWorkspaceBySlug, isUserInWorkspace } from '@/services/workspace-service'
import { getActiveSeasonForWorkspace } from '@/services/workspace-season-service'
import { getActiveGPForPredictions } from '@/services/prediction-service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'

interface PredictionsRedirectProps {
  slug: string
}

export async function PredictionsRedirect({ slug }: PredictionsRedirectProps) {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) {
    redirect('/w')
  }

  // Verificar que el usuario pertenece al workspace
  const isUserMember = await isUserInWorkspace(session.user.id, workspace.id)
  if (!isUserMember) {
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

  // Obtener GP activo para predicciones
  const activeGP = await getActiveGPForPredictions(activeSeason.seasonId)
  if (!activeGP) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>No hay GP activo para predicciones</CardTitle>
            <CardDescription>
              El próximo Grand Prix aún no está disponible para predicciones o ya pasó el deadline
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

  // Redirigir al GP activo
  redirect(`/w/${slug}/predictions/${activeGP.id}`)
}