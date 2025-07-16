import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getGrandPrixById } from '@/services/grand-prix-service'
import {
  Calendar,
  ChevronLeft,
  Edit,
  Flag,
  HelpCircle,
  MapPin,
  Trophy,
  Users,
  Rocket,
  CheckCircle2,
  Circle,
  Pause
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LaunchGPButton } from '../launch-gp-button'
import { SendRemindersSection } from '../send-reminders-section'
import { SendLaunchNotificationsButton } from '../send-launch-notifications-button'
import { GPStatusControls } from '../gp-status-controls'

export const dynamic = 'force-dynamic'

interface GrandPrixDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function GrandPrixDetailPage({ params }: GrandPrixDetailPageProps) {
  const { id } = await params
  const grandPrix = await getGrandPrixById(id)
  
  if (!grandPrix) {
    notFound()
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/grand-prix">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{grandPrix.name}</h1>
            <p className="text-muted-foreground">
              Ronda {grandPrix.round} - {grandPrix.season?.name}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/admin/grand-prix/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{grandPrix.location}, {grandPrix.country}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span>{grandPrix.circuit}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Clasificación: {grandPrix.formattedDates?.qualifyingLocal}</span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="h-4 w-4 text-muted-foreground" />
                <span>Carrera: {grandPrix.formattedDates?.raceLocal}</span>
              </div>
            </div>

            {grandPrix.isSprint && (
              <Badge variant="secondary">Formato Sprint</Badge>
            )}
          </CardContent>
        </Card>

        {/* Estado y Estadísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Estado y Estadísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estado</span>
              <div className="flex items-center gap-2">
                {grandPrix.status === 'CREATED' && (
                  <Badge variant="secondary" className="gap-1">
                    <Circle className="h-3 w-3" />
                    Creado
                  </Badge>
                )}
                {grandPrix.status === 'ACTIVE' && (
                  <Badge variant="default" className="gap-1">
                    <Rocket className="h-3 w-3" />
                    Activo
                  </Badge>
                )}
                {grandPrix.status === 'PAUSED' && (
                  <Badge variant="destructive" className="gap-1">
                    <Pause className="h-3 w-3" />
                    Pausado
                  </Badge>
                )}
                {grandPrix.status === 'FINISHED' && (
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Finalizado
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Preguntas configuradas</span>
              <span className="font-medium">{grandPrix._count?.gpQuestions || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Predicciones realizadas</span>
              <span className="font-medium">{grandPrix._count?.predictions || 0}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Resultados oficiales</span>
              <span className="font-medium">{grandPrix._count?.officialResults || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control de Estado */}
      <Card>
        <CardHeader>
          <CardTitle>Control de Estado</CardTitle>
          <CardDescription>
            {grandPrix.status === 'CREATED' && 'El Grand Prix está creado pero aún no está disponible para los competidores'}
            {grandPrix.status === 'ACTIVE' && 'El Grand Prix está activo y abierto para predicciones'}
            {grandPrix.status === 'PAUSED' && 'El Grand Prix está pausado temporalmente'}
            {grandPrix.status === 'FINISHED' && 'El Grand Prix ha finalizado'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {grandPrix.status === 'CREATED' && (
              <>
                <p className="text-sm text-muted-foreground">
                  Para que los competidores puedan realizar predicciones, debes lanzar el Grand Prix.
                  Asegúrate de que todas las preguntas estén configuradas antes de lanzar.
                </p>
                <LaunchGPButton grandPrix={grandPrix} />
              </>
            )}
            
            {(grandPrix.status === 'ACTIVE' || grandPrix.status === 'PAUSED') && (
              <>
                <p className="text-sm text-muted-foreground">
                  {grandPrix.status === 'ACTIVE' 
                    ? 'Puedes pausar temporalmente el GP o finalizarlo cuando termine la carrera.'
                    : 'El GP está pausado. Puedes reactivarlo o finalizarlo definitivamente.'}
                </p>
                <GPStatusControls grandPrix={grandPrix} />
              </>
            )}
            
            {grandPrix.status === 'FINISHED' && (
              <p className="text-sm text-muted-foreground">
                El Grand Prix ha finalizado. No se pueden realizar más predicciones.
                Puedes proceder a ingresar los resultados oficiales y procesar la puntuación.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Botón para enviar notificaciones si no se enviaron al lanzar */}
      {grandPrix.status === 'ACTIVE' && !grandPrix.notificationsSent && (
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones Pendientes</CardTitle>
            <CardDescription>
              El Grand Prix fue lanzado sin enviar notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Los usuarios aún no han sido notificados sobre este Grand Prix. 
                Puedes enviar las notificaciones ahora.
              </p>
              <SendLaunchNotificationsButton grandPrix={grandPrix} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Envío de Recordatorios */}
      {grandPrix.status === 'ACTIVE' && !grandPrix.isDeadlinePassed && (
        <SendRemindersSection grandPrix={grandPrix} />
      )}

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Gestiona las diferentes secciones de este Grand Prix
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button asChild variant="outline" className="justify-start">
              <Link href={`/admin/grand-prix/${id}/questions`}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Configurar Preguntas
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="justify-start">
              <Link href={`/admin/grand-prix/${id}/official-results`}>
                <Trophy className="mr-2 h-4 w-4" />
                Ingresar Resultados
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="justify-start">
              <Link href={`/admin/scoring`}>
                <Users className="mr-2 h-4 w-4" />
                Procesar Puntuación
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}