# PRP: Sistema de Manejo de Timezone UTC/Local

## Goal
Implementar un sistema completo de manejo de fechas y horas que almacene todas las fechas en UTC en la base de datos y las muestre automáticamente en la zona horaria del navegador del usuario, proporcionando una experiencia clara e intuitiva tanto para administradores como jugadores.

## Why
- **Claridad global**: Los usuarios en diferentes países (Uruguay GMT-3, España GMT+1, etc.) verán las fechas/horas en su zona horaria local
- **Prevención de errores**: Eliminar confusiones sobre horarios de deadlines para predicciones
- **Mejor UX para admins**: Los administradores verán las fechas en su zona horaria al crear/editar GPs
- **Consistencia**: Almacenamiento uniforme en UTC en base de datos, presentación adaptativa en UI
- **Escalabilidad internacional**: Preparar el sistema para usuarios globales

## What
El sistema debe:
1. Almacenar TODAS las fechas en UTC en la base de datos (ya implementado)
2. Detectar automáticamente la zona horaria del navegador del usuario
3. Convertir y mostrar todas las fechas en la zona horaria local del usuario
4. En formularios de admin, permitir entrada en hora local y convertir a UTC antes de guardar
5. Mantener la información del circuito como referencia secundaria (tooltip/texto adicional)
6. Asegurar que los deadlines de predicciones se calculen correctamente en hora local

### Success Criteria
- [ ] Los usuarios en Uruguay (GMT-3) ven las fechas/horas en su zona horaria
- [ ] Los usuarios en España (GMT+1) ven las fechas/horas en su zona horaria  
- [ ] Los formularios de admin aceptan entrada en hora local del admin
- [ ] Los deadlines de predicciones funcionan correctamente independiente de la zona horaria
- [ ] El countdown del próximo GP muestra el tiempo correcto para cada usuario
- [ ] Las notificaciones por email incluyen hora local del destinatario
- [ ] Los tests validan conversiones UTC ↔ Local correctamente
- [ ] Build de producción exitoso sin warnings de hidratación

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Incluir en ventana de contexto
- file: /docs/architecture.md
  why: CRÍTICO - Arquitectura en capas estricta, solo services/ usa Prisma
  
- file: /docs/features.md
  why: Contexto del producto y features implementadas
  sections: "Overview del Proyecto", "Features de Administrador", líneas 1-135
  
- file: prisma/schema.prisma
  why: Modelo GrandPrix con campos de fecha (líneas 168-196)
  
- file: src/services/grand-prix-service.ts
  why: Servicio principal con lógica de conversión de fechas actual
  sections: "Funciones de conversión temporal" líneas 553-587
  
- file: src/app/admin/grand-prix/grand-prix-form.tsx
  why: Formulario de creación/edición que debe adaptarse
  
- file: src/app/admin/grand-prix/date-display.tsx
  why: Componente actual de visualización de fechas que necesita mejora
  
- file: src/lib/deadline-utils.ts
  why: Utilidades de cálculo de deadlines que deben considerar timezone

- url: https://developer.mozilla.org/en-US/docs/Web/API/Intl/DateTimeFormat
  why: API nativa del navegador para formateo de fechas
  section: "timezone option"
  
- url: https://date-fns.org/docs/Time-Zones
  why: Documentación de date-fns-tz para conversiones
```

### Current Codebase Tree
```bash
# Estado actual relevante
src/
├── services/
│   └── grand-prix-service.ts         # Conversiones UTC ↔ Local del circuito
├── app/
│   └── admin/
│       └── grand-prix/
│           ├── grand-prix-form.tsx   # Formulario con timezone del circuito
│           ├── date-display.tsx      # Muestra hora local y del circuito
│           └── deadline-display.tsx  # Countdown en tiempo real
├── lib/
│   └── deadline-utils.ts            # Cálculos de tiempo restante
└── components/
    └── emails/
        └── gp-launched-email.tsx    # Email con fechas
```

### Desired Codebase Tree
```bash
# Archivos nuevos y modificados
src/
├── services/
│   └── grand-prix-service.ts         # MODIFY: Simplificar, todo UTC
├── app/
│   └── admin/
│       └── grand-prix/
│           ├── grand-prix-form.tsx   # MODIFY: Entrada en hora local del usuario
│           ├── date-display.tsx      # MODIFY: Siempre hora local primaria
│           └── deadline-display.tsx  # MODIFY: Cálculos en hora local
├── lib/
│   ├── deadline-utils.ts            # MODIFY: Considerar timezone usuario
│   └── date-formatting.ts           # CREATE: Utilidades centralizadas
├── hooks/
│   └── use-user-timezone.ts         # CREATE: Hook para detectar timezone
└── components/
    ├── ui/
    │   └── date-time-display.tsx    # CREATE: Componente unificado
    └── emails/
        └── gp-launched-email.tsx    # MODIFY: Incluir zona horaria
```

### Known Gotchas & Patterns
```typescript
// CRITICAL: Hidratación SSR/Cliente en Next.js 15
// El servidor no conoce la zona horaria del navegador
// Solución: Renderizar UTC en servidor, hora local tras hidratación

// PATTERN: Hook para detectar timezone del usuario
// hooks/use-user-timezone.ts
export function useUserTimezone() {
  const [timezone, setTimezone] = useState<string>('UTC')
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
    setIsClient(true)
  }, [])
  
  return { timezone, isClient }
}

// GOTCHA: date-fns-tz formatInTimeZone vs format
// formatInTimeZone: Convierte a una zona específica
// format: Usa la zona horaria local del sistema
import { format } from 'date-fns' // Hora local automática
import { formatInTimeZone } from 'date-fns-tz' // Zona específica

// PATTERN: Componente que evita problemas de hidratación
export function DateTimeDisplay({ date }: { date: Date }) {
  const { timezone, isClient } = useUserTimezone()
  
  // Durante SSR, mostrar en UTC o placeholder
  if (!isClient) {
    return <span>{date.toISOString()}</span>
  }
  
  // Tras hidratación, mostrar en hora local
  return <span>{format(date, 'PPpp', { locale: es })}</span>
}

// GOTCHA: Formularios deben convertir hora local → UTC
// Al guardar: new Date(localDateTimeString) → automáticamente UTC
// Al editar: UTC → mostrar en zona local del usuario

// CRITICAL: No usar date.toLocaleString() para formateo
// Usar date-fns con locale español para consistencia
```

## Implementation Blueprint

### Data Models & Structure
```typescript
// 1. NO CHANGES to Prisma Schema - ya está en UTC
model GrandPrix {
  raceDate       DateTime  // Ya en UTC ✓
  qualifyingDate DateTime  // Ya en UTC ✓
  timezone       String    // Mantener para referencia del circuito
}

// 2. Tipos TypeScript para UI
export interface GrandPrixDisplay {
  id: string
  raceDate: Date           // UTC desde BD
  qualifyingDate: Date     // UTC desde BD
  circuitTimezone: string  // Para mostrar como referencia
  // Campos calculados en cliente:
  raceDateLocal?: string
  qualifyingDateLocal?: string
}

// 3. Utilidades centralizadas
// src/lib/date-formatting.ts
export const DATE_FORMATS = {
  FULL: 'PPpp',           // "Apr 29, 2023 at 10:52 AM"
  DATE_ONLY: 'PP',       // "Apr 29, 2023"
  TIME_ONLY: 'p',        // "10:52 AM"
  SHORT: 'MMM dd, HH:mm' // "Apr 29, 10:52"
} as const

export function formatInUserTimezone(
  date: Date | string,
  formatStr: keyof typeof DATE_FORMATS = 'FULL'
) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, DATE_FORMATS[formatStr], { locale: es })
}
```

### Task List (Orden de Implementación)
```yaml
Task 1: Create Timezone Hook
CREATE src/hooks/use-user-timezone.ts:
  - DETECT browser timezone usando Intl API
  - HANDLE SSR con estado isClient
  - EXPORT timezone string y isClient boolean
  - TEST con diferentes navegadores/zonas

Task 2: Create Date Formatting Utilities
CREATE src/lib/date-formatting.ts:
  - CENTRALIZE formatos de fecha constantes
  - FUNCTION formatInUserTimezone() para UI
  - FUNCTION formatForEmail() con zona específica
  - USE date-fns con locale español
  - AVOID date.toLocaleString() 

Task 3: Create Unified DateTime Component
CREATE src/components/ui/date-time-display.tsx:
  - USE useUserTimezone hook
  - HANDLE hidratación SSR correctamente
  - PROPS: date, format, showCircuitTime, className
  - SHOW placeholder durante SSR
  - RENDER hora local tras hidratación
  - OPTIONAL: tooltip con hora del circuito

Task 4: Update Grand Prix Service
MODIFY src/services/grand-prix-service.ts:
  - REMOVE conversiones a hora del circuito en queries
  - KEEP todo en UTC desde la BD
  - SIMPLIFY addFormattedDates() - solo retornar UTC
  - MAINTAIN validaciones de negocio en UTC

Task 5: Update Grand Prix Form
MODIFY src/app/admin/grand-prix/grand-prix-form.tsx:
  - DETECT zona horaria del admin con useUserTimezone
  - INPUT fecha/hora en zona local del admin
  - CONVERT a UTC antes de enviar al servidor
  - SHOW zona horaria actual del admin en UI
  - VALIDATE en hora local, convertir a UTC

Task 6: Update Date Display Component
MODIFY src/app/admin/grand-prix/date-display.tsx:
  - USE nuevo DateTimeDisplay component
  - PRIMARY: hora local del usuario
  - SECONDARY: hora del circuito (tooltip/pequeño)
  - REMOVE lógica duplicada

Task 7: Update Deadline Display
MODIFY src/app/admin/grand-prix/deadline-display.tsx:
  - CALCULATE tiempo restante en zona local
  - USE useUserTimezone para cálculos
  - MAINTAIN actualización cada 60s
  - FIX cualquier problema de hidratación

Task 8: Update Deadline Utils
MODIFY src/lib/deadline-utils.ts:
  - ACCEPT timezone parameter opcional
  - DEFAULT a UTC si no se proporciona
  - CALCULATE correctamente para zona del usuario

Task 9: Update User-Facing Components
MODIFY src/app/w/[slug]/next-gp-card.tsx:
  - USE DateTimeDisplay para fechas
  - SHOW hora local del usuario
  - COUNTDOWN en su zona horaria

MODIFY src/app/w/[slug]/predictions/[gpId]/prediction-table-client.tsx:
  - DISPLAY deadline en hora local
  - USE formatInUserTimezone()

Task 10: Update Email Templates
MODIFY src/components/emails/gp-launched-email.tsx:
  - INCLUDE zona horaria en el email
  - FORMAT fechas considerando destinatario
  - ADD texto explicativo de zona horaria

Task 11: Update Tables and Lists
MODIFY src/app/admin/grand-prix/grand-prix-table-client.tsx:
  - USE DateTimeDisplay en columnas
  - SHOW hora local del admin

MODIFY src/app/admin/grand-prix/upcoming-deadlines-banner.tsx:
  - CALCULATE deadlines en hora local
  - UPDATE mensajes con hora local

Task 12: Testing & Validation
CREATE src/services/__tests__/timezone-conversion.test.ts:
  - TEST conversiones UTC ↔ Local
  - TEST diferentes zonas horarias
  - TEST hidratación SSR
  - VALIDATE no hay warnings de hidratación
```

### Per-Task Pseudocode
```typescript
// Task 1: Timezone Hook
// src/hooks/use-user-timezone.ts
'use client'
import { useState, useEffect } from 'react'

export function useUserTimezone() {
  const [timezone, setTimezone] = useState<string>('UTC')
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    // Detectar timezone del navegador
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setTimezone(tz)
    setIsClient(true)
  }, [])
  
  return { timezone, isClient }
}

// Task 3: Unified DateTime Component  
// src/components/ui/date-time-display.tsx
'use client'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatInTimeZone } from 'date-fns-tz'
import { useUserTimezone } from '@/hooks/use-user-timezone'
import { Tooltip } from '@/components/ui/tooltip'

interface Props {
  date: Date | string
  formatStr?: string
  showCircuitTime?: boolean
  circuitTimezone?: string
  className?: string
}

export function DateTimeDisplay({ 
  date, 
  formatStr = 'PPpp',
  showCircuitTime,
  circuitTimezone,
  className 
}: Props) {
  const { timezone, isClient } = useUserTimezone()
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  
  // SSR: Mostrar ISO string o skeleton
  if (!isClient) {
    return (
      <span className={className} suppressHydrationWarning>
        {dateObj.toISOString()}
      </span>
    )
  }
  
  // Cliente: Mostrar hora local
  const localTime = format(dateObj, formatStr, { locale: es })
  
  if (showCircuitTime && circuitTimezone) {
    const circuitTime = formatInTimeZone(
      dateObj, 
      circuitTimezone, 
      formatStr, 
      { locale: es }
    )
    
    return (
      <Tooltip content={`Hora del circuito: ${circuitTime}`}>
        <span className={className}>{localTime}</span>
      </Tooltip>
    )
  }
  
  return <span className={className}>{localTime}</span>
}

// Task 5: Update Form para entrada local
// src/app/admin/grand-prix/grand-prix-form.tsx (parcial)
export function GrandPrixForm({ grandPrix }: Props) {
  const { timezone: userTimezone, isClient } = useUserTimezone()
  
  // Convertir UTC a local para edición
  const getLocalDateTime = (utcDate: Date | null) => {
    if (!utcDate || !isClient) return ''
    // format retorna en zona local automáticamente
    return format(utcDate, "yyyy-MM-dd'T'HH:mm")
  }
  
  // Al enviar: convertir local a UTC
  const handleSubmit = async (data: FormData) => {
    const raceDateTime = data.get('raceDateTime') as string
    // new Date() con string local crea Date en UTC
    const raceDate = new Date(raceDateTime)
    
    // Enviar al servidor en UTC
    await createGrandPrix({
      ...otherData,
      raceDate: raceDate.toISOString()
    })
  }
  
  return (
    <form>
      <label>
        Fecha y Hora de Carrera (Tu hora local: {userTimezone})
        <input
          type="datetime-local"
          name="raceDateTime"
          defaultValue={getLocalDateTime(grandPrix?.raceDate)}
        />
      </label>
    </form>
  )
}
```

### Integration Points
```yaml
BROWSER APIs:
  - Intl.DateTimeFormat() para detectar timezone
  - type="datetime-local" para inputs de fecha/hora
  
SSR/HIDRATACIÓN:
  - suppressHydrationWarning donde sea necesario
  - Mostrar placeholder o UTC durante SSR
  - Actualizar a hora local tras hidratación
  
VALIDACIONES:
  - Deadline de predicciones: Siempre en UTC en servidor
  - Mostrar deadline: Convertir a hora local en cliente
  - Formularios: Validar en local, guardar en UTC

NOTIFICACIONES:
  - Detectar zona horaria del destinatario (si está disponible)
  - Incluir ambas horas (local estimada + UTC) en emails
  - Texto claro explicando la zona horaria
```

## Validation Loop

### Level 1: Syntax & Types
```bash
# Ejecutar después de cada task
pnpm run lint
pnpm run typecheck
# Expected: 0 errores, 0 warnings
```

### Level 2: Hidratación SSR
```bash
# Verificar no hay warnings de hidratación
pnpm run dev
# Abrir console del navegador
# Expected: NO warnings "Text content did not match"
# Expected: NO warnings "Hydration failed"
```

### Level 3: Unit Tests
```typescript
// src/hooks/__tests__/use-user-timezone.test.ts
import { renderHook } from '@testing-library/react'
import { useUserTimezone } from '../use-user-timezone'

describe('useUserTimezone', () => {
  test('detects browser timezone', async () => {
    const { result } = renderHook(() => useUserTimezone())
    
    // Inicialmente no es cliente
    expect(result.current.isClient).toBe(false)
    expect(result.current.timezone).toBe('UTC')
    
    // Después de montar
    await waitFor(() => {
      expect(result.current.isClient).toBe(true)
      expect(result.current.timezone).toBeTruthy()
    })
  })
})

// src/lib/__tests__/date-formatting.test.ts
describe('Date Formatting', () => {
  test('formats in user timezone', () => {
    const date = new Date('2024-03-15T14:00:00Z')
    // Mock user in Argentina (GMT-3)
    const formatted = formatInUserTimezone(date, 'SHORT')
    expect(formatted).toContain('11:00') // 14:00 UTC = 11:00 GMT-3
  })
})
```

### Level 4: Integration Testing Manual
```bash
# Test con diferentes zonas horarias
pnpm run dev

# 1. Cambiar zona horaria del sistema a Uruguay (GMT-3)
# 2. Crear un GP con hora 15:00
# 3. Verificar se guarda como 18:00 UTC
# 4. Cambiar zona a España (GMT+1)  
# 5. Verificar el mismo GP muestra 19:00

# Test formularios
# 1. Editar GP existente
# 2. Verificar fecha/hora se muestra en hora local
# 3. Guardar sin cambios
# 4. Verificar no cambia en BD
```

### Level 5: Production Build
```bash
pnpm run build
# Expected: Build exitoso, no warnings

pnpm run start
# Test mismas validaciones que en dev
# Verificar no hay diferencias SSR vs cliente
```

## Final Checklist

### Arquitectura
- [ ] Solo services/ accede a Prisma (architecture.md)
- [ ] Componentes cliente usan hooks para timezone
- [ ] Utilidades centralizadas en lib/
- [ ] No hay lógica de timezone en servicios

### Funcionalidad Core
- [ ] Usuarios ven fechas en su zona horaria local
- [ ] Admins ingresan fechas en su hora local
- [ ] Base de datos almacena todo en UTC
- [ ] Deadlines funcionan correctamente
- [ ] Countdown muestra tiempo correcto

### UX/UI
- [ ] No hay warnings de hidratación
- [ ] Fechas se actualizan suavemente tras carga
- [ ] Tooltips muestran hora del circuito cuando es relevante
- [ ] Formularios indican zona horaria actual
- [ ] Emails incluyen información de timezone

### Testing
- [ ] Tests unitarios pasan
- [ ] No errores de lint/types
- [ ] Build de producción exitoso
- [ ] Probado con al menos 3 zonas horarias diferentes

## Anti-Patterns to Avoid

### Timezone Handling
- ❌ NO usar date.toLocaleString() - usar date-fns
- ❌ NO hardcodear zonas horarias en el código
- ❌ NO hacer conversiones de timezone en servicios
- ❌ NO asumir la zona horaria del usuario
- ❌ NO mezclar UTC y hora local en la BD

### SSR/Hidratación
- ❌ NO renderizar hora local durante SSR
- ❌ NO usar Date() sin considerar hidratación
- ❌ NO ignorar warnings de hidratación
- ❌ NO usar useEffect para fechas críticas de UI

### Formularios
- ❌ NO enviar hora local al servidor sin conversión
- ❌ NO validar deadlines en el cliente únicamente
- ❌ NO usar timezone del circuito para cálculos de usuario

## Score de Confianza

**Score: 9/10**

Este PRP proporciona una guía exhaustiva para implementar el sistema de manejo de timezones. La alta puntuación se debe a:
- Contexto completo del estado actual del sistema
- Instrucciones paso a paso detalladas
- Ejemplos de código específicos del proyecto
- Consideraciones de SSR/hidratación cubiertas
- Validaciones y testing bien definidos

El punto restante se debe a que pueden surgir casos edge específicos de F1 (carreras que cruzan medianoche, eventos en múltiples días) que podrían requerir ajustes menores durante la implementación.