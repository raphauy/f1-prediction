'use server'

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  createGrandPrix,
  updateGrandPrix,
  deleteGrandPrix,
  CreateGrandPrixData,
  UpdateGrandPrixData,
  launchGrandPrix,
  finishGrandPrix,
  pauseGrandPrix,
  resumeGrandPrix
} from '@/services/grand-prix-service'
import { sendGPReminders, sendGPLaunchedNotifications } from '@/services/notification-service'
import { z } from 'zod'
import { fromZonedTime } from 'date-fns-tz'

// Schema para el formulario con fechas locales (datetime-local input)
const grandPrixFormSchema = z.object({
  seasonId: z.string().cuid(),
  round: z.coerce.number().int().min(1).max(30),
  name: z.string().min(1).max(100),
  location: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  circuit: z.string().min(1).max(100),
  raceDateTime: z.string().min(1), // Input datetime-local en hora del usuario
  qualifyingDateTime: z.string().min(1), // Input datetime-local en hora del usuario
  isSprint: z.boolean().default(false),
  timezone: z.string().min(1), // Zona horaria del circuito
  userTimezone: z.string().min(1).optional(), // Zona horaria del navegador del usuario
})

export async function createGrandPrixAction(formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'superadmin') {
    redirect('/login')
  }

  let shouldRedirect = false

  try {
    const data = grandPrixFormSchema.parse({
      seasonId: formData.get('seasonId'),
      round: formData.get('round'),
      name: formData.get('name'),
      location: formData.get('location'),
      country: formData.get('country'),
      circuit: formData.get('circuit'),
      raceDateTime: formData.get('raceDateTime'),
      qualifyingDateTime: formData.get('qualifyingDateTime'),
      isSprint: formData.get('isSprint') === 'true',
      timezone: formData.get('timezone'),
      userTimezone: formData.get('userTimezone') as string,
    })

    // Convertir las fechas de la zona horaria del usuario a UTC
    // Si no tenemos la zona del usuario, usar 'America/Montevideo' como default
    const userTz = data.userTimezone || 'America/Montevideo'
    
    // fromZonedTime convierte una fecha en zona horaria específica a UTC
    // Primero parseamos la fecha como si fuera en la zona del usuario
    const raceDateLocal = new Date(data.raceDateTime)
    const qualifyingDateLocal = new Date(data.qualifyingDateTime)
    
    // fromZonedTime interpreta la fecha como si estuviera en userTz y la convierte a UTC
    const raceDate = fromZonedTime(raceDateLocal, userTz)
    const qualifyingDate = fromZonedTime(qualifyingDateLocal, userTz)

    // Crear datos para el servicio con fechas ya en UTC
    const grandPrixData: CreateGrandPrixData = {
      seasonId: data.seasonId,
      round: data.round,
      name: data.name,
      location: data.location,
      country: data.country,
      circuit: data.circuit,
      raceDate,
      qualifyingDate,
      isSprint: data.isSprint,
      timezone: data.timezone, // Zona horaria del circuito para referencia
    }

    await createGrandPrix(grandPrixData)

    revalidatePath('/admin/grand-prix')
    shouldRedirect = true
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Mostrar detalles específicos del error de validación
      const fieldErrors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { success: false, error: `Datos inválidos: ${fieldErrors}` }
    }
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Error al crear el Grand Prix' }
  }

  if (shouldRedirect) {
    redirect('/admin/grand-prix')
  }
}

export async function updateGrandPrixAction(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'superadmin') {
    redirect('/login')
  }

  let shouldRedirect = false
  
  try {
    const data = grandPrixFormSchema.parse({
      seasonId: formData.get('seasonId'),
      round: formData.get('round'),
      name: formData.get('name'),
      location: formData.get('location'),
      country: formData.get('country'),
      circuit: formData.get('circuit'),
      raceDateTime: formData.get('raceDateTime'),
      qualifyingDateTime: formData.get('qualifyingDateTime'),
      isSprint: formData.get('isSprint') === 'true',
      timezone: formData.get('timezone'),
      userTimezone: formData.get('userTimezone') as string,
    })

    // Convertir las fechas de la zona horaria del usuario a UTC
    const userTz = data.userTimezone || 'America/Montevideo'
    
    // fromZonedTime convierte una fecha en zona horaria específica a UTC
    const raceDateLocal = new Date(data.raceDateTime)
    const qualifyingDateLocal = new Date(data.qualifyingDateTime)
    
    // fromZonedTime interpreta la fecha como si estuviera en userTz y la convierte a UTC
    const raceDate = fromZonedTime(raceDateLocal, userTz)
    const qualifyingDate = fromZonedTime(qualifyingDateLocal, userTz)

    // Crear datos para el servicio con fechas ya en UTC
    const grandPrixData: UpdateGrandPrixData = {
      round: data.round,
      name: data.name,
      location: data.location,
      country: data.country,
      circuit: data.circuit,
      raceDate,
      qualifyingDate,
      isSprint: data.isSprint,
      timezone: data.timezone, // Zona horaria del circuito para referencia
    }

    await updateGrandPrix(id, grandPrixData)

    revalidatePath('/admin/grand-prix')
    shouldRedirect = true
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Mostrar detalles específicos del error de validación
      const fieldErrors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { success: false, error: `Datos inválidos: ${fieldErrors}` }
    }
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Error al actualizar el Grand Prix' }
  }
  
  if (shouldRedirect) {
    redirect('/admin/grand-prix')
  }
}

export async function deleteGrandPrixAction(id: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'superadmin') {
    redirect('/login')
  }

  try {
    await deleteGrandPrix(id)
    revalidatePath('/admin/grand-prix')
    return { success: true }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Error al eliminar el Grand Prix' }
  }
}

export async function launchGrandPrixAction(grandPrixId: string, sendNotifications: boolean = true) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'superadmin') {
    return { success: false, error: 'No autorizado' }
  }

  try {
    await launchGrandPrix({
      grandPrixId,
      launchedByUserId: session.user.id,
      sendNotifications
    })
    
    revalidatePath('/admin/grand-prix')
    revalidatePath(`/admin/grand-prix/${grandPrixId}`)
    
    const message = sendNotifications 
      ? 'Grand Prix lanzado exitosamente. Las notificaciones se están enviando.'
      : 'Grand Prix lanzado exitosamente. No se enviaron notificaciones.'
    
    return { 
      success: true, 
      message
    }
  } catch (error) {
    console.error('Error al lanzar GP:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Error al lanzar el Grand Prix' }
  }
}

export async function sendGPRemindersAction(grandPrixId: string, customMessage?: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'superadmin') {
    return { success: false, error: 'No autorizado' }
  }

  try {
    const result = await sendGPReminders({
      grandPrixId,
      sentByUserId: session.user.id,
      customMessage
    })
    
    revalidatePath('/admin/grand-prix')
    revalidatePath(`/admin/grand-prix/${grandPrixId}`)
    
    return { 
      success: true, 
      message: `Recordatorios enviados: ${result.sentCount} de ${result.totalUsers} usuarios`,
      details: result
    }
  } catch (error) {
    console.error('Error al enviar recordatorios:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Error al enviar recordatorios' }
  }
}

export async function finishGrandPrixAction(grandPrixId: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'superadmin') {
    return { success: false, error: 'No autorizado' }
  }

  try {
    await finishGrandPrix(grandPrixId)
    
    revalidatePath('/admin/grand-prix')
    revalidatePath(`/admin/grand-prix/${grandPrixId}`)
    
    return { 
      success: true, 
      message: 'Grand Prix finalizado exitosamente'
    }
  } catch (error) {
    console.error('Error al finalizar GP:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Error al finalizar el Grand Prix' }
  }
}

export async function sendLaunchNotificationsAction(grandPrixId: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'superadmin') {
    return { success: false, error: 'No autorizado' }
  }

  try {
    const result = await sendGPLaunchedNotifications({
      grandPrixId,
      sentByUserId: session.user.id
    })
    
    revalidatePath('/admin/grand-prix')
    revalidatePath(`/admin/grand-prix/${grandPrixId}`)
    
    return { 
      success: result.success,
      message: result.message,
      details: {
        sentCount: result.sentCount,
        totalUsers: result.totalUsers,
        errors: result.errors
      }
    }
  } catch (error) {
    console.error('Error al enviar notificaciones de lanzamiento:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Error al enviar notificaciones' }
  }
}

export async function pauseGrandPrixAction(grandPrixId: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'superadmin') {
    return { success: false, error: 'No autorizado' }
  }

  try {
    await pauseGrandPrix(grandPrixId)
    
    revalidatePath('/admin/grand-prix')
    revalidatePath(`/admin/grand-prix/${grandPrixId}`)
    
    return { 
      success: true, 
      message: 'Grand Prix pausado exitosamente'
    }
  } catch (error) {
    console.error('Error al pausar GP:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Error al pausar el Grand Prix' }
  }
}

export async function resumeGrandPrixAction(grandPrixId: string) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'superadmin') {
    return { success: false, error: 'No autorizado' }
  }

  try {
    await resumeGrandPrix(grandPrixId)
    
    revalidatePath('/admin/grand-prix')
    revalidatePath(`/admin/grand-prix/${grandPrixId}`)
    
    return { 
      success: true, 
      message: 'Grand Prix reactivado exitosamente'
    }
  } catch (error) {
    console.error('Error al reactivar GP:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Error al reactivar el Grand Prix' }
  }
}