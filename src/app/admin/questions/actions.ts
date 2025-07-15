'use server'

import { createQuestion, updateQuestion, deleteQuestion } from '@/services/question-service'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { QuestionType, QuestionCategory } from '@prisma/client'

export async function createQuestionAction(formData: FormData) {
  try {
    const data = {
      text: formData.get('text') as string,
      type: formData.get('type') as QuestionType,
      category: formData.get('category') as QuestionCategory,
      defaultPoints: parseInt(formData.get('defaultPoints') as string),
    }

    await createQuestion(data)
    revalidatePath('/admin/questions')
    redirect('/admin/questions')
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear la pregunta',
    }
  }
}

export async function updateQuestionAction(id: string, formData: FormData) {
  try {
    const data = {
      text: formData.get('text') as string,
      type: formData.get('type') as QuestionType,
      category: formData.get('category') as QuestionCategory,
      defaultPoints: parseInt(formData.get('defaultPoints') as string),
    }

    await updateQuestion(id, data)
    revalidatePath('/admin/questions')
    redirect('/admin/questions')
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar la pregunta',
    }
  }
}

export async function deleteQuestionAction(id: string) {
  try {
    await deleteQuestion(id)
    revalidatePath('/admin/questions')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar la pregunta',
    }
  }
}