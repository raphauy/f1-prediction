'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Pause, Play, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { pauseGrandPrixAction, resumeGrandPrixAction, finishGrandPrixAction } from './actions'
import { toast } from 'sonner'
import { GrandPrixWithDetails } from '@/services/grand-prix-service'
import { useRouter } from 'next/navigation'

interface GPStatusControlsProps {
  grandPrix: GrandPrixWithDetails
}

export function GPStatusControls({ grandPrix }: GPStatusControlsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [actionType, setActionType] = useState<'pause' | 'resume' | 'finish' | null>(null)
  const router = useRouter()

  const handlePause = async () => {
    setIsLoading(true)
    try {
      const result = await pauseGrandPrixAction(grandPrix.id)
      
      if (result.success) {
        toast.success(result.message || 'Grand Prix pausado exitosamente')
        router.refresh()
      } else {
        toast.error(result.error || 'Error al pausar el Grand Prix')
      }
    } catch {
      toast.error('Error inesperado al pausar el Grand Prix')
    } finally {
      setIsLoading(false)
      setActionType(null)
    }
  }

  const handleResume = async () => {
    setIsLoading(true)
    try {
      const result = await resumeGrandPrixAction(grandPrix.id)
      
      if (result.success) {
        toast.success(result.message || 'Grand Prix reactivado exitosamente')
        router.refresh()
      } else {
        toast.error(result.error || 'Error al reactivar el Grand Prix')
      }
    } catch {
      toast.error('Error inesperado al reactivar el Grand Prix')
    } finally {
      setIsLoading(false)
      setActionType(null)
    }
  }

  const handleFinish = async () => {
    setIsLoading(true)
    try {
      const result = await finishGrandPrixAction(grandPrix.id)
      
      if (result.success) {
        toast.success(result.message || 'Grand Prix finalizado exitosamente')
        router.refresh()
      } else {
        toast.error(result.error || 'Error al finalizar el Grand Prix')
      }
    } catch {
      toast.error('Error inesperado al finalizar el Grand Prix')
    } finally {
      setIsLoading(false)
      setActionType(null)
    }
  }

  const canPause = grandPrix.status === 'ACTIVE'
  const canResume = grandPrix.status === 'PAUSED'
  const canFinish = grandPrix.status === 'ACTIVE' || grandPrix.status === 'PAUSED'
  const hasOfficialResults = (grandPrix._count?.officialResults || 0) > 0

  return (
    <div className="flex flex-wrap gap-2">
      {/* Botón Pausar */}
      {canPause && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              disabled={isLoading}
              onClick={() => setActionType('pause')}
            >
              {isLoading && actionType === 'pause' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Pausando...
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  Pausar GP
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Pausar Grand Prix?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>
                    Al pausar el <strong>{grandPrix.name}</strong>:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>El GP no será visible para los competidores</li>
                    <li>Se suspenderán temporalmente las predicciones</li>
                    <li>Podrás reactivarlo en cualquier momento</li>
                  </ul>
                  
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-3">
                    <div className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800 dark:text-amber-200">
                        <p>Esta acción es temporal. Los usuarios no perderán sus predicciones existentes.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handlePause}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Pausar Grand Prix
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Botón Reanudar */}
      {canResume && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              disabled={isLoading}
              onClick={() => setActionType('resume')}
            >
              {isLoading && actionType === 'resume' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Reactivando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Reanudar GP
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Reanudar Grand Prix?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>
                    Al reanudar el <strong>{grandPrix.name}</strong>:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>El GP volverá a ser visible para los competidores</li>
                    <li>Se reactivarán las predicciones</li>
                    <li>Los usuarios podrán continuar donde lo dejaron</li>
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleResume}
                className="bg-green-600 hover:bg-green-700"
              >
                Reanudar Grand Prix
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Botón Finalizar */}
      {canFinish && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              disabled={isLoading}
              onClick={() => setActionType('finish')}
            >
              {isLoading && actionType === 'finish' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Finalizar GP
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Finalizar Grand Prix?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>
                    Al finalizar el <strong>{grandPrix.name}</strong>:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Se cerrará definitivamente el período de predicciones</li>
                    <li>No se podrán realizar más cambios</li>
                    <li>El GP quedará listo para procesar resultados</li>
                    <li>Esta acción <strong>no se puede deshacer</strong></li>
                  </ul>
                  
                  {!hasOfficialResults && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-3">
                      <div className="flex gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800 dark:text-amber-200">
                          <p className="font-medium">Advertencia:</p>
                          <p>Aún no has ingresado resultados oficiales. Normalmente deberías finalizar el GP después de la carrera.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleFinish}
                className="bg-red-600 hover:bg-red-700"
              >
                Finalizar Grand Prix
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}