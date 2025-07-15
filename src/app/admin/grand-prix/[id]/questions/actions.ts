'use server'

import {
  addQuestionToGP,
  removeQuestionFromGP,
  updateGPQuestion,
  reorderGPQuestions,
  applyStandardQuestionsToGP,
  createPilotFocusQuestionsForGP,
  createGPQuestionFromTemplate,
  type CreateGPQuestionData,
  type UpdateGPQuestionData,
} from '@/services/question-service'
import { applyTemplatesToGP } from '@/services/question-template-service'
import { updateGrandPrix } from '@/services/grand-prix-service'
import { revalidatePath } from 'next/cache'

export async function addQuestionToGPAction(data: CreateGPQuestionData) {
  try {
    await addQuestionToGP(data)
    revalidatePath(`/admin/grand-prix/${data.grandPrixId}/questions`)
    return { success: true }
  } catch (error) {
    console.error('Error en addQuestionToGPAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al agregar la pregunta',
    }
  }
}

export async function removeQuestionFromGPAction(grandPrixId: string, questionId: string) {
  try {
    await removeQuestionFromGP(grandPrixId, questionId)
    // Revalidar la ruta específica - usar revalidatePath con type='page' para forzar actualización completa
    revalidatePath(`/admin/grand-prix/${grandPrixId}/questions`, 'page')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al eliminar la pregunta',
    }
  }
}

export async function updateGPQuestionAction(id: string, data: UpdateGPQuestionData) {
  try {
    await updateGPQuestion(id, data)
    revalidatePath('/admin/grand-prix')
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar la pregunta',
    }
  }
}

export async function reorderGPQuestionsAction(
  grandPrixId: string,
  questionOrders: { id: string; order: number }[]
) {
  try {
    await reorderGPQuestions(grandPrixId, questionOrders)
    revalidatePath(`/admin/grand-prix/${grandPrixId}/questions`)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al reordenar las preguntas',
    }
  }
}

export async function applyStandardQuestionsAction(grandPrixId: string) {
  try {
    const result = await applyStandardQuestionsToGP(grandPrixId)
    revalidatePath(`/admin/grand-prix/${grandPrixId}/questions`)
    // El resultado es un BatchPayload con count o un array
    const count = 'count' in result ? result.count : result.length
    return { success: true, count }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al aplicar preguntas estándar',
    }
  }
}

export async function createPilotFocusQuestionsAction(grandPrixId: string, pilotName: string) {
  try {
    await createPilotFocusQuestionsForGP(grandPrixId, pilotName)
    revalidatePath(`/admin/grand-prix/${grandPrixId}/questions`)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear preguntas del piloto',
    }
  }
}

export async function updateGrandPrixPilotAction(grandPrixId: string, focusPilot: string, focusPilotContext?: string) {
  try {
    await updateGrandPrix(grandPrixId, {
      focusPilot,
      focusPilotContext: focusPilotContext || undefined,
    })
    revalidatePath(`/admin/grand-prix/${grandPrixId}/questions`)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el piloto',
    }
  }
}

export async function createQuestionFromTemplateAction(
  templateId: string,
  grandPrixId: string,
  customData?: {
    points?: number
    text?: string
    options?: unknown
  }
) {
  try {
    await createGPQuestionFromTemplate(templateId, grandPrixId, customData)
    revalidatePath(`/admin/grand-prix/${grandPrixId}/questions`)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear pregunta desde plantilla',
    }
  }
}

export async function applyMultipleTemplatesAction(
  grandPrixId: string,
  templateIds: string[]
) {
  try {
    await applyTemplatesToGP(grandPrixId, templateIds)
    revalidatePath(`/admin/grand-prix/${grandPrixId}/questions`)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al aplicar plantillas',
    }
  }
}