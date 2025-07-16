'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Mail, Loader2, Users, Clock } from 'lucide-react'
import { sendGPRemindersAction } from './actions'
import { toast } from 'sonner'
import { GrandPrixWithDetails } from '@/services/grand-prix-service'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface SendRemindersSectionProps {
  grandPrix: GrandPrixWithDetails
}

export function SendRemindersSection({ grandPrix }: SendRemindersSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  
  const timeRemaining = formatDistanceToNow(new Date(grandPrix.qualifyingDate), { 
    locale: es,
    addSuffix: false 
  })

  const handleSendReminders = async () => {
    setIsLoading(true)
    try {
      const result = await sendGPRemindersAction(
        grandPrix.id, 
        customMessage || undefined
      )
      
      if (result.success) {
        toast.success(result.message || 'Recordatorios enviados exitosamente')
        setIsOpen(false)
        setCustomMessage('')
        
        // Mostrar detalles si están disponibles
        if (result.details) {
          const { usersWithoutPredictions, usersWithPredictions } = result.details
          if (usersWithoutPredictions > 0 || usersWithPredictions > 0) {
            toast.info(
              `Enviados a: ${usersWithoutPredictions} usuarios sin predicciones y ${usersWithPredictions} usuarios con predicciones`
            )
          }
        }
      } else {
        toast.error(result.error || 'Error al enviar recordatorios')
      }
    } catch {
      toast.error('Error inesperado al enviar recordatorios')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envío de Recordatorios</CardTitle>
        <CardDescription>
          Envía recordatorios a los competidores sobre el cierre de predicciones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex gap-2">
              <Clock className="h-4 w-4 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Tiempo restante: {timeRemaining}
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Las predicciones se cerrarán cuando comience la clasificación
                </p>
              </div>
            </div>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Mail className="h-4 w-4" />
                Enviar Recordatorios
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Enviar Recordatorios</DialogTitle>
                <DialogDescription>
                  Se enviarán emails a todos los usuarios activos recordándoles sobre el cierre de predicciones
                  del {grandPrix.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="customMessage">
                    Mensaje personalizado (opcional)
                  </Label>
                  <Textarea
                    id="customMessage"
                    placeholder="Añade un mensaje adicional al recordatorio..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Este mensaje se incluirá en el log de actividad
                  </p>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                  <div className="flex gap-2">
                    <Users className="h-4 w-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                      <p className="font-medium">Se notificará a:</p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        <li>Usuarios que aún no han hecho predicciones (prioridad)</li>
                        <li>Usuarios que ya hicieron predicciones (para revisar)</li>
                        <li>Solo usuarios con recordatorios habilitados</li>
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
                  onClick={handleSendReminders}
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
                      Enviar Recordatorios
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}