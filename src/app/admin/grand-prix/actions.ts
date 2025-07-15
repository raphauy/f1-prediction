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
  convertLocalDateToUTC,
} from '@/services/grand-prix-service'
import { z } from 'zod'

// Schema para el formulario con fechas locales
const grandPrixFormSchema = z.object({
  seasonId: z.string().cuid(),
  round: z.coerce.number().int().min(1).max(30),
  name: z.string().min(1).max(100),
  location: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  circuit: z.string().min(1).max(100),
  raceDate: z.string().min(1),
  raceTime: z.string().min(1),
  qualifyingDate: z.string().min(1),
  qualifyingTime: z.string().min(1),
  isSprint: z.boolean().default(false),
  timezone: z.string().min(1),
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
      raceDate: formData.get('raceDate'),
      raceTime: formData.get('raceTime'),
      qualifyingDate: formData.get('qualifyingDate'),
      qualifyingTime: formData.get('qualifyingTime'),
      isSprint: formData.get('isSprint') === 'true',
      timezone: formData.get('timezone'),
    })

    // Combinar fecha y hora locales
    const raceLocalDateTime = new Date(`${data.raceDate}T${data.raceTime}:00`)
    const qualifyingLocalDateTime = new Date(`${data.qualifyingDate}T${data.qualifyingTime}:00`)

    // Convertir a UTC para almacenamiento
    const grandPrixData: CreateGrandPrixData = {
      ...data,
      raceDate: convertLocalDateToUTC(raceLocalDateTime, data.timezone),
      qualifyingDate: convertLocalDateToUTC(qualifyingLocalDateTime, data.timezone),
    }

    await createGrandPrix(grandPrixData)

    revalidatePath('/admin/grand-prix')
    shouldRedirect = true
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Datos inválidos' }
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
      raceDate: formData.get('raceDate'),
      raceTime: formData.get('raceTime'),
      qualifyingDate: formData.get('qualifyingDate'),
      qualifyingTime: formData.get('qualifyingTime'),
      isSprint: formData.get('isSprint') === 'true',
      timezone: formData.get('timezone'),
    })

    // Combinar fecha y hora locales
    const raceLocalDateTime = new Date(`${data.raceDate}T${data.raceTime}:00`)
    const qualifyingLocalDateTime = new Date(`${data.qualifyingDate}T${data.qualifyingTime}:00`)

    // Convertir a UTC para almacenamiento
    const grandPrixData: UpdateGrandPrixData = {
      round: data.round,
      name: data.name,
      location: data.location,
      country: data.country,
      circuit: data.circuit,
      raceDate: convertLocalDateToUTC(raceLocalDateTime, data.timezone),
      qualifyingDate: convertLocalDateToUTC(qualifyingLocalDateTime, data.timezone),
      isSprint: data.isSprint,
      timezone: data.timezone,
    }

    await updateGrandPrix(id, grandPrixData)

    revalidatePath('/admin/grand-prix')
    shouldRedirect = true
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Datos inválidos' }
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