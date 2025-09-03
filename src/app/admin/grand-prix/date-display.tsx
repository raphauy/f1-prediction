'use client'

import { DateTimeDisplay } from '@/components/ui/date-time-display'

interface DateDisplayProps {
  date: Date | string
  gpTimezone: string
  showIcon?: boolean
}

/**
 * Wrapper del DateTimeDisplay para mantener compatibilidad con el código existente
 * Muestra la fecha/hora en la zona horaria local del usuario
 * con la hora del circuito en un tooltip
 */
export function DateDisplay({ date, gpTimezone, showIcon = true }: DateDisplayProps) {
  return (
    <DateTimeDisplay 
      date={date}
      formatStr="SHORT"
      showCircuitTime
      circuitTimezone={gpTimezone}
      showIcon={showIcon}
      className="text-sm"
    />
  )
}