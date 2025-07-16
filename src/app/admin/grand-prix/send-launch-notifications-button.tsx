'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Mail, Loader2, AlertCircle, Users } from 'lucide-react'
import { sendLaunchNotificationsAction } from './actions'
import { toast } from 'sonner'
import { GrandPrixWithDetails } from '@/services/grand-prix-service'

interface SendLaunchNotificationsButtonProps {
  grandPrix: GrandPrixWithDetails
}

export function SendLaunchNotificationsButton({ grandPrix }: SendLaunchNotificationsButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Solo mostrar si el GP está activo y no se han enviado notificaciones
  if (grandPrix.status !== 'ACTIVE' || grandPrix.notificationsSent) {
    return null
  }

  const handleSendNotifications = async () => {
    setIsLoading(true)
    try {
      const result = await sendLaunchNotificationsAction(grandPrix.id)
      
      if (result.success) {
        toast.success(result.message || 'Notificaciones enviadas exitosamente')
        setIsOpen(false)
        
        if (result.details) {
          toast.info(`Enviadas a ${result.details.sentCount} usuarios`)
        }
      } else {
        toast.error(result.error || 'Error al enviar notificaciones')
      }
    } catch {
      toast.error('Error inesperado al enviar notificaciones')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Mail className="h-4 w-4" />
          Enviar Notificaciones de Lanzamiento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Notificaciones de Lanzamiento</DialogTitle>
          <DialogDescription>
            El Grand Prix fue lanzado sin enviar notificaciones. ¿Deseas enviarlas ahora?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">Información:</p>
                <p>Se enviará un email a todos los usuarios activos notificándoles que el {grandPrix.name} está disponible para realizar predicciones.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex gap-2">
              <Users className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium">Destinatarios:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Usuarios con notificaciones de GP habilitadas</li>
                  <li>Miembros activos de workspaces con esta temporada</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSendNotifications}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Enviar Notificaciones
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}