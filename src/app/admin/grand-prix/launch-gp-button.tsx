'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
import { Rocket, Loader2, AlertCircle, Mail } from 'lucide-react'
import { launchGrandPrixAction } from './actions'
import { toast } from 'sonner'
import { GrandPrixWithDetails } from '@/services/grand-prix-service'

interface LaunchGPButtonProps {
  grandPrix: GrandPrixWithDetails
}

export function LaunchGPButton({ grandPrix }: LaunchGPButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [sendNotifications, setSendNotifications] = useState(true)
  
  const canLaunch = grandPrix.status === 'CREATED' && 
                    (grandPrix._count?.gpQuestions || 0) > 0 &&
                    new Date(grandPrix.qualifyingDate) > new Date()

  const handleLaunch = async () => {
    setIsLoading(true)
    try {
      const result = await launchGrandPrixAction(grandPrix.id, sendNotifications)
      
      if (result.success) {
        toast.success(result.message || 'Grand Prix lanzado exitosamente')
        if (!sendNotifications) {
          toast.info('No se enviaron notificaciones por email')
        }
      } else {
        toast.error(result.error || 'Error al lanzar el Grand Prix')
      }
    } catch {
      toast.error('Error inesperado al lanzar el Grand Prix')
    } finally {
      setIsLoading(false)
    }
  }

  if (!canLaunch) {
    return null
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          size="sm" 
          className="gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Lanzando...
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4" />
              Lanzar GP
            </>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Lanzar Grand Prix?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Al lanzar el <strong>{grandPrix.name}</strong>, ocurrirá lo siguiente:
              </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>El GP cambiará de estado &ldquo;Creado&rdquo; a &ldquo;Activo&rdquo;</li>
              <li>Se habilitará para que los competidores realicen predicciones</li>
              {sendNotifications && (
                <li>Se enviarán emails de notificación a todos los usuarios activos</li>
              )}
              <li>Esta acción no se puede deshacer</li>
            </ul>
            
            <div className="flex items-center space-x-3 py-4 px-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <Switch
                id="send-notifications"
                checked={sendNotifications}
                onCheckedChange={setSendNotifications}
              />
              <Label 
                htmlFor="send-notifications" 
                className="cursor-pointer flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Enviar notificaciones por email
              </Label>
            </div>
            
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mt-3">
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium">Importante:</p>
                  <p>Asegúrate de que todas las preguntas estén configuradas correctamente antes de lanzar.</p>
                  {!sendNotifications && (
                    <p className="mt-1">
                      <strong>Modo testing:</strong> Las notificaciones no se enviarán. Podrás enviarlas manualmente después.
                    </p>
                  )}
                </div>
              </div>
            </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleLaunch}
            className="bg-red-600 hover:bg-red-700"
          >
            Lanzar Grand Prix
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}