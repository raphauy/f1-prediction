'use server'

import { createQuestion } from '@/services/question-service'
import { QuestionType, QuestionCategory } from '@prisma/client'

export async function createPilotFocusQuestionAction(pilotName: string, text: string, type: QuestionType, defaultPoints: number) {
  try {
    const fullText = text.includes(pilotName) ? text : `${text} (${pilotName})`
    
    const question = await createQuestion({
      text: fullText,
      type,
      category: QuestionCategory.PILOT_FOCUS,
      defaultPoints,
      options: {
        type: 'pilot_specific',
        pilot: pilotName
      }
    })

    return { success: true, question }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear la pregunta',
    }
  }
}