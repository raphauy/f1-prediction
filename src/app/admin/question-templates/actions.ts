'use server'

import { 
  createQuestionTemplate, 
  updateQuestionTemplate, 
  deleteQuestionTemplate,
  type CreateQuestionTemplateData,
  type UpdateQuestionTemplateData 
} from '@/services/question-template-service'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { QuestionType } from '@prisma/client'
import { auth } from '@/lib/auth'

export async function createQuestionTemplateAction(formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== 'superadmin') {
    return { success: false, error: 'No autorizado' }
  }

  let shouldRedirect = false

  try {
    const defaultOptionsString = formData.get('defaultOptions') as string
    let defaultOptions = undefined
    if (defaultOptionsString) {
      try {
        defaultOptions = JSON.parse(defaultOptionsString)
      } catch {
        // Si falla el parse, lo dejamos undefined
      }
    }

    const badgeValue = formData.get('badge') as string
    const badge = badgeValue === '' || badgeValue === 'none' ? undefined : badgeValue || undefined

    const data: CreateQuestionTemplateData = {
      text: formData.get('text') as string,
      type: formData.get('type') as QuestionType,
      category: formData.get('category') as 'CLASSIC' | 'STROLLOMETER',
      defaultPoints: parseInt(formData.get('defaultPoints') as string),
      badge,
      description: formData.get('description') as string || undefined,
      defaultOptions,
      isActive: true,
    }

    await createQuestionTemplate(data)
    revalidatePath('/admin/question-templates')
    shouldRedirect = true
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear la plantilla',
    }
  }

  if (shouldRedirect) {
    redirect('/admin/question-templates')
  }
}

export async function updateQuestionTemplateAction(id: string, formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== 'superadmin') {
    return { success: false, error: 'No autorizado' }
  }

  let shouldRedirect = false

  try {
    const defaultOptionsString = formData.get('defaultOptions') as string
    let defaultOptions = undefined
    if (defaultOptionsString) {
      try {
        defaultOptions = JSON.parse(defaultOptionsString)
      } catch {
        // Si falla el parse, lo dejamos undefined
      }
    }

    const badgeValue = formData.get('badge') as string
    const badge = badgeValue === '' || badgeValue === 'none' ? undefined : badgeValue || undefined

    const data: UpdateQuestionTemplateData = {
      text: formData.get('text') as string,
      type: formData.get('type') as QuestionType,
      category: formData.get('category') as 'CLASSIC' | 'STROLLOMETER',
      defaultPoints: parseInt(formData.get('defaultPoints') as string),
      badge,
      description: formData.get('description') as string || undefined,
      defaultOptions,
    }

    await updateQuestionTemplate(id, data)
    revalidatePath('/admin/question-templates')
    shouldRedirect = true
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar la plantilla',
    }
  }

  if (shouldRedirect) {
    redirect('/admin/question-templates')
  }
}

export async function deleteQuestionTemplateAction(id: string) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'superadmin') {
      return { success: false, error: 'No autorizado' }
    }

    await deleteQuestionTemplate(id)
    revalidatePath('/admin/question-templates')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar la plantilla',
    }
  }
}