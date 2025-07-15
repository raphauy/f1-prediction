'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { getTimeUntilDeadline, getDeadlineStatus } from '@/lib/deadline-utils'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeadlineDisplayProps {
  deadline: Date
  showTimeRemaining?: boolean
}

export function DeadlineDisplay({ deadline, showTimeRemaining = true }: DeadlineDisplayProps) {
  const [mounted, setMounted] = useState(false)
  const [, forceUpdate] = useState({})
  
  useEffect(() => {
    setMounted(true)
    
    // Actualizar cada minuto
    const interval = setInterval(() => {
      forceUpdate({})
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])
  
  if (!mounted) {
    return <Badge variant="outline">Cargando...</Badge>
  }
  
  const { timeRemaining, urgency } = getTimeUntilDeadline(deadline)
  const status = getDeadlineStatus(deadline)
  
  return (
    <div className="flex flex-col gap-1">
      <Badge variant={status.variant} className={cn('text-xs', status.className)}>
        {status.label}
      </Badge>
      {showTimeRemaining && urgency !== 'passed' && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{timeRemaining}</span>
        </div>
      )}
    </div>
  )
}