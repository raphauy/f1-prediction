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
  Users
} from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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

  const now = new Date()
  const hasStarted = new Date(grandPrix.qualifyingDate) < now
  const hasEnded = new Date(grandPrix.raceDate) < now

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
              <Badge variant={hasEnded ? "secondary" : hasStarted ? "default" : "outline"}>
                {hasEnded ? "Finalizado" : hasStarted ? "En progreso" : "Próximo"}
              </Badge>
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