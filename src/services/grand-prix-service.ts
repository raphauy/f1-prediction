import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { GrandPrix, Prisma, QuestionType } from '@prisma/client'
import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz'
import { addDays, differenceInDays, getHours } from 'date-fns'

// Lista de zonas horarias válidas para F1
const VALID_F1_TIMEZONES = [
  'Australia/Melbourne', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Singapore',
  'Asia/Dubai', 'Asia/Baku', 'Asia/Bahrain', 'Asia/Riyadh', 'Asia/Qatar',
  'Europe/Monaco', 'Europe/Madrid', 'Europe/London', 'Europe/Rome',
  'Europe/Budapest', 'Europe/Vienna', 'Europe/Brussels', 'Europe/Amsterdam',
  'America/Montreal', 'America/Toronto', 'America/New_York', 'America/Chicago',
  'America/Los_Angeles', 'America/Mexico_City', 'America/Sao_Paulo'
]

// Schema base sin validaciones de fechas
const grandPrixBaseSchema = z.object({
  seasonId: z.string().cuid(),
  round: z.number().int().min(1).max(30),
  name: z.string().min(1).max(100),
  location: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  circuit: z.string().min(1).max(100),
  raceDate: z.date(),
  qualifyingDate: z.date(),
  isSprint: z.boolean().default(false),
  timezone: z.string().refine(
    (tz) => VALID_F1_TIMEZONES.includes(tz),
    { message: 'Zona horaria no válida para circuitos de F1' }
  ),
  focusPilot: z.string().optional(),
  focusPilotContext: z.string().optional(),
})

// Schema para creación con validaciones estrictas
export const createGrandPrixSchema = grandPrixBaseSchema
  .refine((data) => {
    // Validar que la fecha de clasificación sea anterior a la de carrera
    return data.qualifyingDate < data.raceDate
  }, {
    message: "La fecha de clasificación debe ser anterior a la fecha de carrera",
    path: ["qualifyingDate"]
  })
  .refine((data) => {
    // Validar que las fechas sean futuras (solo para creación)
    const now = new Date()
    return data.qualifyingDate > now
  }, {
    message: "La fecha de clasificación debe ser futura",
    path: ["qualifyingDate"]
  })
  .refine((data) => {
    // Validar diferencia entre clasificación y carrera
    const diffDays = differenceInDays(data.raceDate, data.qualifyingDate)
    
    if (data.isSprint) {
      // Para Sprint: normalmente 2 días (viernes clasificación, domingo carrera)
      return diffDays >= 2 && diffDays <= 3
    } else {
      // Para carrera normal: normalmente 1 día (sábado clasificación, domingo carrera)
      return diffDays >= 1 && diffDays <= 2
    }
  }, {
    message: "La diferencia de días entre clasificación y carrera no es correcta",
    path: ["qualifyingDate"]
  })
  .refine((data) => {
    // Validar horarios típicos de F1 en hora local
    const qualifyingLocalTime = toZonedTime(data.qualifyingDate, data.timezone)
    const raceLocalTime = toZonedTime(data.raceDate, data.timezone)
    
    const qualifyingHour = getHours(qualifyingLocalTime)
    const raceHour = getHours(raceLocalTime)
    
    // Clasificación típicamente entre 13:00 y 18:00 hora local
    const qualifyingValid = qualifyingHour >= 13 && qualifyingHour <= 18
    
    // Carrera típicamente entre 12:00 y 16:00 hora local (excepto Las Vegas)
    const isLasVegas = data.location.toLowerCase().includes('vegas')
    const raceValid = isLasVegas 
      ? (raceHour >= 20 || raceHour <= 2) // Las Vegas: carreras nocturnas
      : (raceHour >= 12 && raceHour <= 16)
    
    return qualifyingValid && raceValid
  }, {
    message: "Los horarios no coinciden con los típicos de F1. Clasificación: 13:00-18:00, Carrera: 12:00-16:00 (hora local)",
    path: ["qualifyingDate"]
  })

// Schema para actualización con validaciones más flexibles
export const updateGrandPrixSchema = grandPrixBaseSchema
  .partial()
  .omit({ seasonId: true })
  .refine((data) => {
    // Solo validar si ambas fechas están presentes
    if (data.qualifyingDate && data.raceDate) {
      return data.qualifyingDate < data.raceDate
    }
    return true
  }, {
    message: "La fecha de clasificación debe ser anterior a la fecha de carrera",
    path: ["qualifyingDate"]
  })
  .refine((data) => {
    // Validar diferencia si ambas fechas están presentes
    if (data.qualifyingDate && data.raceDate && data.isSprint !== undefined) {
      const diffDays = differenceInDays(data.raceDate, data.qualifyingDate)
      
      if (data.isSprint) {
        return diffDays >= 2 && diffDays <= 3
      } else {
        return diffDays >= 1 && diffDays <= 2
      }
    }
    return true
  }, {
    message: "La diferencia de días entre clasificación y carrera no es correcta",
    path: ["qualifyingDate"]
  })

export type CreateGrandPrixData = z.infer<typeof createGrandPrixSchema>
export type UpdateGrandPrixData = z.infer<typeof updateGrandPrixSchema>

// Tipo extendido para incluir información calculada
export type GrandPrixWithDetails = GrandPrix & {
  _count?: {
    predictions?: number
    gpQuestions?: number
    officialResults?: number
  }
  season?: {
    year: number
    name: string
  }
  isDeadlinePassed?: boolean
  formattedDates?: {
    race: string
    qualifying: string
    raceLocal: string
    qualifyingLocal: string
  }
}

// Funciones de servicio

export async function getAllGrandPrix(seasonId?: string) {
  const where: Prisma.GrandPrixWhereInput = seasonId ? { seasonId } : {}
  
  const grandPrix = await prisma.grandPrix.findMany({
    where,
    orderBy: {
      raceDate: 'asc'
    },
    include: {
      season: true,
      _count: {
        select: {
          predictions: true,
          gpQuestions: true,
          officialResults: true,
        },
      },
    },
  })
  
  // Añadir información de fechas formateadas y deadline
  return grandPrix.map(gp => addFormattedDates(gp))
}

export async function getGrandPrixById(id: string) {
  const gp = await prisma.grandPrix.findUnique({
    where: { id },
    include: {
      season: true,
      gpQuestions: {
        include: {
          question: true,
        },
        orderBy: { order: 'asc' },
      },
      _count: {
        select: {
          predictions: true,
          gpQuestions: true,
          officialResults: true,
        },
      },
    },
  })
  
  if (!gp) return null
  
  return addFormattedDates(gp)
}

export async function getGrandPrixBySeasonAndRound(seasonId: string, round: number) {
  const gp = await prisma.grandPrix.findFirst({
    where: {
      seasonId,
      round,
    },
    include: {
      season: true,
      gpQuestions: {
        include: {
          question: true,
        },
        orderBy: { order: 'asc' },
      },
    },
  })
  
  if (!gp) return null
  
  return addFormattedDates(gp)
}

export async function createGrandPrix(data: CreateGrandPrixData) {
  const validated = createGrandPrixSchema.parse(data)
  
  // Verificar que la temporada existe
  const season = await prisma.season.findUnique({
    where: { id: validated.seasonId },
  })
  
  if (!season) {
    throw new Error('La temporada especificada no existe')
  }
  
  // Validar que las fechas estén dentro del rango de la temporada
  if (validated.raceDate < season.startDate || validated.raceDate > season.endDate) {
    throw new Error('Las fechas del Grand Prix deben estar dentro del período de la temporada')
  }
  
  // Verificar que no exista un GP con el mismo round en la temporada
  const existing = await prisma.grandPrix.findFirst({
    where: {
      seasonId: validated.seasonId,
      round: validated.round,
    },
  })
  
  if (existing) {
    throw new Error(`Ya existe un Grand Prix con el round ${validated.round} en esta temporada`)
  }
  
  // Verificar solapamiento con otros GPs (mínimo 5 días entre carreras)
  const nearbyGPs = await prisma.grandPrix.findMany({
    where: {
      seasonId: validated.seasonId,
      raceDate: {
        gte: addDays(validated.raceDate, -5),
        lte: addDays(validated.raceDate, 5),
      },
    },
  })
  
  if (nearbyGPs.length > 0) {
    const conflictingGP = nearbyGPs[0]
    throw new Error(
      `El Grand Prix está muy cerca de "${conflictingGP.name}" (${conflictingGP.raceDate.toLocaleDateString()}). ` +
      `Debe haber al menos 5 días entre carreras.`
    )
  }
  
  // Crear el Grand Prix
  const grandPrix = await prisma.grandPrix.create({
    data: validated,
    include: {
      season: true,
    },
  })
  
  // Obtener las plantillas de preguntas activas (clásicas y strollómetro) y asignarlas automáticamente
  const standardTemplates = await prisma.questionTemplate.findMany({
    where: {
      category: {
        in: ['CLASSIC', 'STROLLOMETER']
      },
      isActive: true
    },
    orderBy: [
      { category: 'asc' },
      { createdAt: 'asc' }
    ],
  })
  
  if (standardTemplates.length > 0) {
    await prisma.gPQuestion.createMany({
      data: standardTemplates.map((template, index) => ({
        grandPrixId: grandPrix.id,
        templateId: template.id,
        text: template.text,
        type: template.type,
        category: template.category,
        badge: template.badge,
        options: template.defaultOptions || undefined,
        points: template.defaultPoints,
        order: index + 1,
      })),
    })
  }
  
  return addFormattedDates(grandPrix)
}

export async function updateGrandPrix(id: string, data: UpdateGrandPrixData) {
  const validated = updateGrandPrixSchema.parse(data)
  
  // Obtener el GP actual con información de temporada y predicciones
  const currentGP = await prisma.grandPrix.findUnique({
    where: { id },
    include: {
      season: true,
      _count: {
        select: {
          predictions: true,
        },
      },
    },
  })
  
  if (!currentGP) {
    throw new Error('Grand Prix no encontrado')
  }
  
  // Si hay predicciones, solo permitir cambios menores
  if (currentGP._count.predictions > 0) {
    if (validated.qualifyingDate || validated.raceDate) {
      throw new Error(
        'No se pueden modificar las fechas de un Grand Prix que ya tiene predicciones registradas'
      )
    }
  }
  
  // Si se está actualizando el round, verificar que no exista
  if (validated.round !== undefined) {
    const existing = await prisma.grandPrix.findFirst({
      where: {
        seasonId: currentGP.seasonId,
        round: validated.round,
        NOT: { id },
      },
    })
    
    if (existing) {
      throw new Error(`Ya existe un Grand Prix con el round ${validated.round} en esta temporada`)
    }
  }
  
  // Validar fechas contra la temporada si se proporcionan
  if (validated.raceDate) {
    if (validated.raceDate < currentGP.season.startDate || 
        validated.raceDate > currentGP.season.endDate) {
      throw new Error('Las fechas del Grand Prix deben estar dentro del período de la temporada')
    }
    
    // Verificar solapamiento con otros GPs
    const nearbyGPs = await prisma.grandPrix.findMany({
      where: {
        seasonId: currentGP.seasonId,
        raceDate: {
          gte: addDays(validated.raceDate, -5),
          lte: addDays(validated.raceDate, 5),
        },
        NOT: { id },
      },
    })
    
    if (nearbyGPs.length > 0) {
      const conflictingGP = nearbyGPs[0]
      throw new Error(
        `El Grand Prix está muy cerca de "${conflictingGP.name}" (${conflictingGP.raceDate.toLocaleDateString()}). ` +
        `Debe haber al menos 5 días entre carreras.`
      )
    }
  }
  
  const gp = await prisma.grandPrix.update({
    where: { id },
    data: validated,
    include: {
      season: true,
      _count: {
        select: {
          predictions: true,
          gpQuestions: true,
          officialResults: true,
        },
      },
    },
  })
  
  return addFormattedDates(gp)
}

export async function deleteGrandPrix(id: string) {
  // Verificar si hay predicciones para este GP
  const predictionsCount = await prisma.prediction.count({
    where: { grandPrixId: id },
  })
  
  if (predictionsCount > 0) {
    throw new Error('No se puede eliminar un Grand Prix que tiene predicciones registradas')
  }
  
  // Las relaciones en cascada eliminarán GPQuestions automáticamente
  return await prisma.grandPrix.delete({
    where: { id },
  })
}

// Funciones auxiliares

function addFormattedDates(gp: GrandPrix & {
  season?: { year: number; name: string }
  _count?: { predictions?: number; gpQuestions?: number }
}): GrandPrixWithDetails {
  const now = new Date()
  const isDeadlinePassed = now >= new Date(gp.qualifyingDate)
  
  // Formatear fechas en UTC y zona local
  const formattedDates = {
    race: gp.raceDate.toISOString(),
    qualifying: gp.qualifyingDate.toISOString(),
    raceLocal: formatInTimeZone(
      gp.raceDate,
      gp.timezone,
      'MMM dd, yyyy HH:mm zzz'
    ),
    qualifyingLocal: formatInTimeZone(
      gp.qualifyingDate,
      gp.timezone,
      'MMM dd, yyyy HH:mm zzz'
    ),
  }
  
  return {
    ...gp,
    isDeadlinePassed,
    formattedDates,
  }
}

export async function getUpcomingGrandPrix(workspaceId: string) {
  const now = new Date()
  
  // Obtener la temporada activa del workspace
  const activeWorkspaceSeason = await prisma.workspaceSeason.findFirst({
    where: {
      workspaceId,
      isActive: true,
    },
    select: { seasonId: true },
  })
  
  if (!activeWorkspaceSeason) {
    return null
  }
  
  // Obtener el próximo GP (donde la fecha de clasificación aún no ha pasado)
  const gp = await prisma.grandPrix.findFirst({
    where: {
      seasonId: activeWorkspaceSeason.seasonId,
      qualifyingDate: {
        gt: now,
      },
    },
    orderBy: { raceDate: 'asc' },
    include: {
      season: true,
      gpQuestions: {
        include: {
          question: true,
        },
        orderBy: { order: 'asc' },
      },
    },
  })
  
  if (!gp) return null
  
  return addFormattedDates(gp)
}

export async function getPastGrandPrix(workspaceId: string) {
  const now = new Date()
  
  // Obtener la temporada activa del workspace
  const activeWorkspaceSeason = await prisma.workspaceSeason.findFirst({
    where: {
      workspaceId,
      isActive: true,
    },
    select: { seasonId: true },
  })
  
  if (!activeWorkspaceSeason) {
    return []
  }
  
  // Obtener GPs pasados (donde la fecha de carrera ya pasó)
  const grandPrix = await prisma.grandPrix.findMany({
    where: {
      seasonId: activeWorkspaceSeason.seasonId,
      raceDate: {
        lt: now,
      },
    },
    orderBy: { round: 'desc' },
    include: {
      season: true,
      _count: {
        select: {
          predictions: true,
        },
      },
    },
  })
  
  return grandPrix.map(gp => addFormattedDates(gp))
}

// Función para verificar si un GP está bloqueado para predicciones
export async function isGrandPrixLocked(grandPrixId: string): Promise<boolean> {
  const gp = await prisma.grandPrix.findUnique({
    where: { id: grandPrixId },
    select: { qualifyingDate: true },
  })
  
  if (!gp) {
    return true
  }
  
  // El GP se bloquea cuando comienza la clasificación
  return new Date() >= gp.qualifyingDate
}

// Funciones adicionales para manejo de zonas horarias

// Función para convertir hora local a UTC para almacenamiento
export function convertLocalDateToUTC(localDate: Date, timezone: string): Date {
  return fromZonedTime(localDate, timezone)
}

// Función para obtener la hora actual en la zona del GP
export function getCurrentTimeInGPTimezone(timezone: string): Date {
  return toZonedTime(new Date(), timezone)
}

// Función para verificar deadlines próximos
export async function getGrandPrixWithUpcomingDeadlines(hoursAhead: number = 24) {
  const now = new Date()
  const futureDate = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000)
  
  const grandPrix = await prisma.grandPrix.findMany({
    where: {
      qualifyingDate: {
        gte: now,
        lte: futureDate,
      },
    },
    orderBy: { qualifyingDate: 'asc' },
    include: {
      season: true,
      _count: {
        select: {
          predictions: true,
        },
      },
    },
  })
  
  return grandPrix.map(gp => addFormattedDates(gp))
}

// Funciones para manejo del piloto en foco

export async function updateFocusPilot(id: string, focusPilot: string | null, focusPilotContext?: string | null) {
  return await prisma.grandPrix.update({
    where: { id },
    data: {
      focusPilot,
      focusPilotContext,
    },
  })
}

// Función para crear preguntas del piloto en foco
export async function createPilotFocusQuestions(grandPrixId: string, pilotName: string) {
  // Plantillas de preguntas para el piloto en foco
  const pilotQuestions = [
    {
      text: `¿En qué posición clasificará ${pilotName}?`,
      type: 'MULTIPLE_CHOICE',
      defaultPoints: 8,
      options: { type: 'custom', values: ['P1-P5', 'P6-P10', 'P11-P15', 'P16-P20'] }
    },
    {
      text: `¿En qué posición terminará ${pilotName} la carrera?`,
      type: 'MULTIPLE_CHOICE',
      defaultPoints: 10,
      options: { type: 'custom', values: ['P1-P3', 'P4-P6', 'P7-P10', 'P11-P15', 'P16-P20', 'DNF'] }
    },
    {
      text: `¿${pilotName} hará podio?`,
      type: 'BOOLEAN',
      defaultPoints: 12,
      options: { type: 'custom', values: ['Sí', 'No'] }
    },
    {
      text: `¿${pilotName} terminará por delante de su compañero de equipo?`,
      type: 'BOOLEAN',
      defaultPoints: 8,
      options: { type: 'custom', values: ['Sí', 'No'] }
    }
  ]

  // Crear las preguntas en la base de datos
  const createdQuestions = []
  for (const q of pilotQuestions) {
    const question = await prisma.question.create({
      data: {
        text: q.text,
        type: q.type as QuestionType,
        category: 'PILOT_FOCUS',
        defaultPoints: q.defaultPoints,
        options: q.options,
      },
    })
    createdQuestions.push(question)
  }

  // Obtener el orden máximo actual en el GP
  const maxOrder = await prisma.gPQuestion.findFirst({
    where: { grandPrixId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const startOrder = (maxOrder?.order || 0) + 1

  // Asignar las preguntas al GP
  await prisma.gPQuestion.createMany({
    data: createdQuestions.map((question, index) => ({
      grandPrixId,
      questionId: question.id,
      points: question.defaultPoints,
      order: startOrder + index,
    })),
  })

  return createdQuestions
}

/**
 * Obtiene un Grand Prix por ID con todas sus relaciones
 */
export async function getGPById(id: string): Promise<GrandPrixWithDetails | null> {
  const gp = await prisma.grandPrix.findUnique({
    where: { id },
    include: {
      season: true,
      gpQuestions: {
        include: {
          question: true
        },
        orderBy: [
          { order: 'asc' },
          { id: 'asc' }
        ]
      },
      _count: {
        select: {
          predictions: true
        }
      }
    }
  })

  if (!gp) return null

  return addFormattedDates(gp)
}