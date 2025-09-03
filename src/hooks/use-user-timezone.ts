'use client'

import { useState, useEffect } from 'react'

/**
 * Hook para detectar la zona horaria del navegador del usuario
 * Maneja correctamente SSR/hidratación en Next.js
 */
export function useUserTimezone() {
  const [timezone, setTimezone] = useState<string>('UTC')
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    // Detectar timezone del navegador usando Intl API
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(tz)
    setIsClient(true)
  }, [])
  
  return { 
    timezone, 
    isClient 
  }
}