import { PrismaClient } from '@prisma/client'
import { fromZonedTime } from 'date-fns-tz'

const prisma = new PrismaClient()

// Función para convertir hora local a UTC
function convertLocalDateToUTC(localDate: Date, timezone: string): Date {
  return fromZonedTime(localDate, timezone)
}

async function updateGrandPrixDates() {
  console.log('🏁 Actualizando fechas de Grand Prix con horarios reales...')
  
  // Horarios típicos de F1 (hora local del circuito)
  const typicalRaceTime = 14 // 14:00 para la mayoría
  const typicalQualiTime = 15 // 15:00 para clasificación
  
  // Casos especiales de horarios
  const specialCases: Record<string, { raceTime: number; qualiTime: number }> = {
    'Las Vegas': { raceTime: 22, qualiTime: 21 }, // Carrera nocturna
    'Singapore': { raceTime: 20, qualiTime: 21 }, // Carrera nocturna
    'Bahrain': { raceTime: 18, qualiTime: 18 }, // Atardecer
    'Saudi Arabia': { raceTime: 20, qualiTime: 20 }, // Nocturna
    'Abu Dhabi': { raceTime: 17, qualiTime: 17 }, // Atardecer
    'Qatar': { raceTime: 19, qualiTime: 19 }, // Atardecer
  }
  
  // Obtener todos los GPs
  const grandPrix = await prisma.grandPrix.findMany({
    orderBy: { round: 'asc' }
  })
  
  console.log(`Encontrados ${grandPrix.length} Grand Prix para actualizar`)
  
  for (const gp of grandPrix) {
    // Determinar horarios basados en la ubicación
    let raceHour = typicalRaceTime
    let qualiHour = typicalQualiTime
    
    // Buscar casos especiales
    for (const [location, times] of Object.entries(specialCases)) {
      if (gp.location.includes(location) || gp.name.includes(location)) {
        raceHour = times.raceTime
        qualiHour = times.qualiTime
        break
      }
    }
    
    // Miami y Austin tienen horarios especiales por ser en USA
    if (gp.location.includes('Miami') || gp.location.includes('Austin')) {
      raceHour = 15 // 3 PM hora local
      qualiHour = 16 // 4 PM hora local para clasificación
    }
    
    // Crear las fechas con hora local correcta
    const raceDate = new Date(gp.raceDate)
    raceDate.setHours(0, 0, 0, 0) // Reset a medianoche
    const raceDateWithTime = new Date(raceDate)
    raceDateWithTime.setHours(raceHour, 0, 0, 0)
    
    const qualiDate = new Date(gp.qualifyingDate)
    qualiDate.setHours(0, 0, 0, 0) // Reset a medianoche
    const qualiDateWithTime = new Date(qualiDate)
    qualiDateWithTime.setHours(qualiHour, 0, 0, 0)
    
    // Convertir a UTC para almacenamiento
    const raceUTC = convertLocalDateToUTC(raceDateWithTime, gp.timezone)
    const qualiUTC = convertLocalDateToUTC(qualiDateWithTime, gp.timezone)
    
    // Actualizar en la base de datos
    await prisma.grandPrix.update({
      where: { id: gp.id },
      data: {
        raceDate: raceUTC,
        qualifyingDate: qualiUTC
      }
    })
    
    console.log(`✅ ${gp.name}: Carrera ${raceHour}:00, Clasificación ${qualiHour}:00 (hora local)`)
  }
  
  console.log('✨ Todas las fechas han sido actualizadas con horarios reales de F1')
}

updateGrandPrixDates()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })