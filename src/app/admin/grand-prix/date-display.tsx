'use client'

import { useEffect, useState } from 'react'
import { format, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatInTimeZone } from 'date-fns-tz'
import { Globe, Clock } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface DateDisplayProps {
  date: Date | string
  gpTimezone: string
  showIcon?: boolean
}

export function DateDisplay({ date: dateProp, gpTimezone, showIcon = true }: DateDisplayProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Parsear la fecha correctamente
  let date: Date
  if (typeof dateProp === 'string') {
    date = parseISO(dateProp)
  } else if (dateProp instanceof Date) {
    date = dateProp
  } else {
    date = parseISO(String(dateProp))
  }
  
  // Validar que la fecha sea válida
  if (!isValid(date)) {
    console.error('Fecha inválida:', dateProp)
    return <div className="text-xs text-muted-foreground">Fecha inválida</div>
  }
  
  // Calcular la hora del GP
  const gpDateTime = formatInTimeZone(date, gpTimezone, 'MMM dd, yyyy HH:mm zzz', { locale: es })
  const gpDatePart = formatInTimeZone(date, gpTimezone, 'MMM dd, yyyy', { locale: es })
  const gpTimePart = formatInTimeZone(date, gpTimezone, 'HH:mm zzz', { locale: es })
  
  // Durante SSR o antes de montar, mostrar hora del GP
  if (!mounted) {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-sm">
          {showIcon && <Globe className="h-3 w-3" />}
          <span>{gpDatePart}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{gpTimePart}</span>
        </div>
      </div>
    )
  }
  
  // En el cliente, calcular hora local
  const localDatePart = format(date, "MMM dd, yyyy", { locale: es })
  const localTimePart = format(date, "HH:mm")
  
  // Obtener timezone del usuario
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  
  // Obtener abreviación del timezone o usar la ciudad
  let timezoneDisplay = ''
  
  // Intentar obtener la abreviación (GMT-3, EST, etc)
  const tzAbbr = new Intl.DateTimeFormat('es', {
    timeZoneName: 'short',
    timeZone: localTimezone
  }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value
  
  if (tzAbbr && !tzAbbr.includes('GMT')) {
    // Si tenemos una abreviación que no es GMT, usarla
    timezoneDisplay = tzAbbr
  } else {
    // Si no, extraer la ciudad del timezone (ej: America/Montevideo -> Montevideo)
    const parts = localTimezone.split('/')
    const city = parts[parts.length - 1].replace(/_/g, ' ')
    
    // Para algunos casos conocidos, mostrar el país
    const countryMap: Record<string, string> = {
      'Montevideo': 'UY',
      'Buenos_Aires': 'AR', 
      'Sao_Paulo': 'BR',
      'New_York': 'US',
      'Los_Angeles': 'US',
      'Chicago': 'US',
      'London': 'UK',
      'Paris': 'FR',
      'Madrid': 'ES',
      'Rome': 'IT',
      'Berlin': 'DE',
      'Tokyo': 'JP',
      'Shanghai': 'CN',
      'Sydney': 'AU',
      'Melbourne': 'AU'
    }
    
    const country = countryMap[parts[parts.length - 1]]
    timezoneDisplay = country || city
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="space-y-1 cursor-help">
            <div className="flex items-center gap-1 text-sm">
              {showIcon && <Globe className="h-3 w-3" />}
              <span>{localDatePart}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{localTimePart} {timezoneDisplay}</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="text-xs font-medium">Hora del circuito:</p>
            <p className="text-xs">{gpDateTime}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}