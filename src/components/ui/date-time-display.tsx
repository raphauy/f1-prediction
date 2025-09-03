'use client'

import { parseISO, isValid } from 'date-fns'
import { Globe, Clock, Calendar } from 'lucide-react'
import { useUserTimezone } from '@/hooks/use-user-timezone'
import { 
  formatInUserTimezone, 
  formatInSpecificTimezone, 
  getTimezoneDisplay,
  type DateFormat 
} from '@/lib/date-formatting'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface DateTimeDisplayProps {
  date: Date | string | null | undefined
  formatStr?: DateFormat
  showCircuitTime?: boolean
  circuitTimezone?: string
  showIcon?: boolean
  className?: string
  iconClassName?: string
  compact?: boolean
  suppressHydration?: boolean
}

/**
 * Componente unificado para mostrar fechas y horas
 * Maneja correctamente SSR/hidratación mostrando UTC durante SSR
 * y hora local del usuario tras hidratación
 */
export function DateTimeDisplay({ 
  date, 
  formatStr = 'FULL',
  showCircuitTime = false,
  circuitTimezone,
  showIcon = false,
  className,
  iconClassName,
  compact = false,
  suppressHydration = true
}: DateTimeDisplayProps) {
  const { timezone, isClient } = useUserTimezone()
  
  // Validar entrada
  if (!date) {
    return <span className={cn('text-muted-foreground', className)}>-</span>
  }
  
  // Parsear la fecha
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  // Validar que la fecha sea válida
  if (!isValid(dateObj)) {
    console.error('Fecha inválida:', date)
    return <span className={cn('text-muted-foreground', className)}>Fecha inválida</span>
  }
  
  // Durante SSR, mostrar un placeholder o la fecha en ISO
  if (!isClient) {
    if (compact) {
      return (
        <span className={className} suppressHydrationWarning={suppressHydration}>
          {dateObj.toISOString().split('T')[0]}
        </span>
      )
    }
    
    return (
      <span className={className} suppressHydrationWarning={suppressHydration}>
        {dateObj.toISOString()}
      </span>
    )
  }
  
  // Cliente: Mostrar hora local del usuario
  const localTime = formatInUserTimezone(dateObj, formatStr)
  const timezoneDisplay = getTimezoneDisplay(timezone)
  
  // Si no necesita mostrar hora del circuito, renderizar simple
  if (!showCircuitTime || !circuitTimezone) {
    if (compact) {
      return (
        <span className={cn('inline-flex items-center gap-1', className)}>
          {showIcon && <Clock className={cn('h-3 w-3', iconClassName)} />}
          <span>{localTime}</span>
        </span>
      )
    }
    
    return (
      <span className={cn('inline-flex items-center gap-1.5', className)}>
        {showIcon && <Calendar className={cn('h-4 w-4', iconClassName)} />}
        <span>{localTime}</span>
        <span className="text-muted-foreground text-xs">({timezoneDisplay})</span>
      </span>
    )
  }
  
  // Con hora del circuito: mostrar en tooltip
  const circuitTime = formatInSpecificTimezone(dateObj, circuitTimezone, formatStr)
  const circuitTzDisplay = getTimezoneDisplay(circuitTimezone)
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('inline-flex items-center gap-1.5 cursor-help', className)}>
            {showIcon && <Globe className={cn('h-4 w-4', iconClassName)} />}
            <span>{localTime}</span>
            <span className="text-muted-foreground text-xs">({timezoneDisplay})</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-xs">
            <div className="font-medium">Hora del circuito:</div>
            <div>{circuitTime}</div>
            <div className="text-muted-foreground">({circuitTzDisplay})</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Variante compacta para tablas
 */
export function DateTimeCell({ date, formatStr = 'SHORT', ...props }: DateTimeDisplayProps) {
  return <DateTimeDisplay date={date} formatStr={formatStr} compact {...props} />
}

/**
 * Variante para mostrar solo fecha
 */
export function DateOnly({ date, ...props }: Omit<DateTimeDisplayProps, 'formatStr'>) {
  return <DateTimeDisplay date={date} formatStr="DATE_ONLY" {...props} />
}

/**
 * Variante para mostrar solo hora
 */
export function TimeOnly({ date, ...props }: Omit<DateTimeDisplayProps, 'formatStr'>) {
  return <DateTimeDisplay date={date} formatStr="TIME_ONLY" showIcon {...props} />
}