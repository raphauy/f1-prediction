import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatInTimeZone } from 'date-fns-tz'

/**
 * Formatos de fecha predefinidos para uso consistente en la aplicación
 */
export const DATE_FORMATS = {
  FULL: "dd/MM/yyyy 'a las' HH:mm",     // "29/04/2023 a las 10:52"
  DATE_ONLY: 'dd/MM/yyyy',              // "29/04/2023"
  TIME_ONLY: 'HH:mm',                   // "10:52" (formato 24h)
  SHORT: 'PP',                          // "6 sep 2025" (formato abreviado con PP)
  SHORT_DATE: 'dd/MM',                  // "29/04"
  DATETIME_LOCAL: "yyyy-MM-dd'T'HH:mm", // Para inputs datetime-local
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",  // ISO 8601
  MONTH_YEAR: 'MMMM yyyy',              // "abril 2023"
  WEEKDAY_DATE: "EEEE, dd/MM/yyyy",     // "sábado, 29/04/2023"
  WITH_TIMEZONE: "dd/MM/yyyy 'a las' HH:mm zzz", // "29/04/2023 a las 10:52 GMT-3"
  SHORT_WITH_TIME: "PP 'a las' HH:mm",  // "6 sep 2025 a las 10:52"
} as const

export type DateFormat = keyof typeof DATE_FORMATS

/**
 * Formatea una fecha en la zona horaria del usuario
 * Utiliza automáticamente el locale español
 * @param date - Fecha a formatear (Date o string ISO)
 * @param formatStr - Formato a utilizar (por defecto 'FULL')
 * @returns Fecha formateada en la zona horaria local del usuario
 */
export function formatInUserTimezone(
  date: Date | string | null | undefined,
  formatStr: DateFormat = 'FULL'
): string {
  if (!date) return ''
  
  const d = typeof date === 'string' ? parseISO(date) : date
  
  // format usa automáticamente la zona horaria del sistema
  return format(d, DATE_FORMATS[formatStr], { locale: es })
}

/**
 * Formatea una fecha en una zona horaria específica
 * Útil para mostrar horarios del circuito o para emails
 * @param date - Fecha a formatear
 * @param timezone - Zona horaria objetivo (ej: "America/Montevideo")
 * @param formatStr - Formato a utilizar
 * @returns Fecha formateada en la zona horaria especificada
 */
export function formatInSpecificTimezone(
  date: Date | string | null | undefined,
  timezone: string,
  formatStr: DateFormat = 'FULL'
): string {
  if (!date) return ''
  
  const d = typeof date === 'string' ? parseISO(date) : date
  
  return formatInTimeZone(d, timezone, DATE_FORMATS[formatStr], { locale: es })
}

/**
 * Formatea fecha para emails incluyendo información de zona horaria
 * @param date - Fecha a formatear
 * @param timezone - Zona horaria del destinatario (si se conoce)
 * @returns Fecha formateada con información clara de zona horaria
 */
export function formatForEmail(
  date: Date | string,
  timezone?: string
): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  
  if (timezone) {
    // Si conocemos la zona del destinatario, mostrar en su hora
    return formatInTimeZone(d, timezone, DATE_FORMATS.WITH_TIMEZONE, { locale: es })
  }
  
  // Si no, mostrar en UTC con indicación clara
  return `${format(d, DATE_FORMATS.FULL, { locale: es })} (UTC)`
}

/**
 * Obtiene el nombre abreviado de la zona horaria del usuario
 * @param timezone - Zona horaria (por defecto la del sistema)
 * @returns Abreviación o nombre de la zona horaria
 */
export function getTimezoneDisplay(timezone?: string): string {
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  const now = new Date()
  
  // Intentar obtener la abreviación (GMT-3, EST, etc)
  const formatter = new Intl.DateTimeFormat('es', {
    timeZoneName: 'short',
    timeZone: tz
  })
  
  const parts = formatter.formatToParts(now)
  const tzPart = parts.find(part => part.type === 'timeZoneName')
  
  if (tzPart?.value && !tzPart.value.includes('GMT')) {
    return tzPart.value
  }
  
  // Si no hay abreviación clara, extraer la ciudad
  const cityName = tz.split('/').pop()?.replace(/_/g, ' ')
  
  // Mapa de ciudades a códigos de país conocidos
  const countryMap: Record<string, string> = {
    'Montevideo': 'UY',
    'Buenos Aires': 'AR',
    'Sao Paulo': 'BR',
    'New York': 'US',
    'Los Angeles': 'US',
    'Chicago': 'US',
    'London': 'UK',
    'Paris': 'FR',
    'Madrid': 'ES',
    'Barcelona': 'ES',
    'Rome': 'IT',
    'Berlin': 'DE',
    'Munich': 'DE',
    'Tokyo': 'JP',
    'Shanghai': 'CN',
    'Sydney': 'AU',
    'Melbourne': 'AU',
    'Mexico City': 'MX',
    'Toronto': 'CA',
    'Montreal': 'CA'
  }
  
  return countryMap[cityName || ''] || cityName || tz
}

/**
 * Convierte una fecha/hora local (del input datetime-local) a UTC para guardar en BD
 * @param localDateTimeString - String del input datetime-local
 * @returns Date en UTC
 */
export function localDateTimeToUTC(localDateTimeString: string): Date {
  // El input datetime-local devuelve sin timezone, 
  // new Date lo interpreta como hora local del sistema
  return new Date(localDateTimeString)
}

/**
 * Convierte una fecha UTC a string para input datetime-local
 * @param utcDate - Fecha en UTC
 * @returns String formateado para input datetime-local
 */
export function utcToLocalDateTimeString(utcDate: Date | string | null | undefined): string {
  if (!utcDate) return ''
  
  try {
    const d = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate
    
    // Verificar que la fecha sea válida
    if (!d || isNaN(d.getTime())) return ''
    
    // format de date-fns automáticamente convierte UTC a hora local del navegador
    // El formato DATETIME_LOCAL es "yyyy-MM-dd'T'HH:mm"
    return format(d, "yyyy-MM-dd'T'HH:mm")
  } catch (error) {
    console.error('Error al convertir fecha a datetime-local:', error)
    return ''
  }
}

/**
 * Formatea una duración relativa (ej: "en 2 horas", "hace 3 días")
 * @param date - Fecha objetivo
 * @param baseDate - Fecha base (por defecto ahora)
 * @returns String con la duración relativa
 */
export function formatRelativeTime(date: Date | string, baseDate: Date = new Date()): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  const diffMs = d.getTime() - baseDate.getTime()
  const absDiffMs = Math.abs(diffMs)
  
  const minutes = Math.floor(absDiffMs / (1000 * 60))
  const hours = Math.floor(absDiffMs / (1000 * 60 * 60))
  const days = Math.floor(absDiffMs / (1000 * 60 * 60 * 24))
  
  const prefix = diffMs > 0 ? 'en ' : 'hace '
  
  if (days > 0) {
    return `${prefix}${days} día${days !== 1 ? 's' : ''}`
  }
  if (hours > 0) {
    return `${prefix}${hours} hora${hours !== 1 ? 's' : ''}`
  }
  if (minutes > 0) {
    return `${prefix}${minutes} minuto${minutes !== 1 ? 's' : ''}`
  }
  
  return diffMs > 0 ? 'en unos momentos' : 'hace unos momentos'
}