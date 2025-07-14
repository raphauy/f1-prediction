'use server'

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  createSeason,
  updateSeason,
  deleteSeason,
  type CreateSeasonData,
  type UpdateSeasonData,
} from '@/services/season-service'

export async function createSeasonAction(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.role || session.user.role !== 'superadmin') {
    throw new Error('No autorizado')
  }
  
  try {
    const data: CreateSeasonData = {
      year: parseInt(formData.get('year') as string),
      name: formData.get('name') as string,
      startDate: new Date(formData.get('startDate') as string),
      endDate: new Date(formData.get('endDate') as string),
      isActive: formData.get('isActive') === 'on',
    }
    
    await createSeason(data)
    
    revalidatePath('/admin/seasons')
    redirect('/admin/seasons')
  } catch (error) {
    console.error('Error creating season:', error)
    throw error
  }
}

export async function updateSeasonAction(id: string, formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.role || session.user.role !== 'superadmin') {
    throw new Error('No autorizado')
  }
  
  try {
    const data: UpdateSeasonData = {
      year: parseInt(formData.get('year') as string),
      name: formData.get('name') as string,
      startDate: new Date(formData.get('startDate') as string),
      endDate: new Date(formData.get('endDate') as string),
      isActive: formData.get('isActive') === 'on',
    }
    
    await updateSeason(id, data)
    
    revalidatePath('/admin/seasons')
    redirect('/admin/seasons')
  } catch (error) {
    console.error('Error updating season:', error)
    throw error
  }
}

export async function deleteSeasonAction(id: string) {
  const session = await auth()
  
  if (!session?.user?.role || session.user.role !== 'superadmin') {
    throw new Error('No autorizado')
  }
  
  try {
    await deleteSeason(id)
    revalidatePath('/admin/seasons')
  } catch (error) {
    console.error('Error deleting season:', error)
    throw error
  }
}

export async function toggleSeasonActiveAction(id: string, isActive: boolean) {
  const session = await auth()
  
  if (!session?.user?.role || session.user.role !== 'superadmin') {
    throw new Error('No autorizado')
  }
  
  try {
    await updateSeason(id, { isActive })
    revalidatePath('/admin/seasons')
  } catch (error) {
    console.error('Error toggling season active state:', error)
    throw error
  }
}