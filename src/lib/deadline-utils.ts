import { differenceInHours, differenceInMinutes, differenceInDays } from 'date-fns'

export function getTimeUntilDeadline(deadline: Date): {
  timeRemaining: string
  urgency: 'critical' | 'warning' | 'normal' | 'passed'
} {
  const now = new Date()
  const diff = deadline.getTime() - now.getTime()
  
  if (diff <= 0) {
    return { timeRemaining: 'Cerrado', urgency: 'passed' }
  }
  
  const days = differenceInDays(deadline, now)
  const hours = differenceInHours(deadline, now)
  const minutes = differenceInMinutes(deadline, now)
  
  let timeRemaining: string
  let urgency: 'critical' | 'warning' | 'normal' | 'passed'
  
  if (days > 7) {
    timeRemaining = `${days} días`
    urgency = 'normal'
  } else if (days > 2) {
    timeRemaining = `${days} días`
    urgency = 'normal'
  } else if (days >= 1) {
    timeRemaining = `${days} día${days > 1 ? 's' : ''}, ${hours % 24} hrs`
    urgency = 'warning'
  } else if (hours >= 1) {
    timeRemaining = `${hours} hora${hours > 1 ? 's' : ''}`
    urgency = hours <= 6 ? 'critical' : 'warning'
  } else {
    timeRemaining = `${minutes} min`
    urgency = 'critical'
  }
  
  return { timeRemaining, urgency }
}

export function getDeadlineStatus(deadline: Date): {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
} {
  const { urgency } = getTimeUntilDeadline(deadline)
  
  switch (urgency) {
    case 'passed':
      return {
        label: 'Cerrado',
        variant: 'secondary'
      }
    case 'critical':
      return {
        label: 'Cierra pronto',
        variant: 'destructive',
        className: 'animate-pulse'
      }
    case 'warning':
      return {
        label: 'Próximo a cerrar',
        variant: 'default',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      }
    case 'normal':
      return {
        label: 'Abierto',
        variant: 'default',
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      }
  }
}