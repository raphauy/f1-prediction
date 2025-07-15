import { getGPQuestions, getAllQuestions } from '@/services/question-service'
import { getGrandPrixById } from '@/services/grand-prix-service'
import { GPQuestionsClient } from './gp-questions-client'

interface GPQuestionsManagerProps {
  grandPrixId: string
}

export async function GPQuestionsManager({ grandPrixId }: GPQuestionsManagerProps) {
  const [gpQuestions, allQuestions, grandPrix] = await Promise.all([
    getGPQuestions(grandPrixId),
    getAllQuestions(),
    getGrandPrixById(grandPrixId),
  ])

  // Filtrar las preguntas que no están asignadas al GP (solo las que tienen questionId)
  const assignedQuestionIds = new Set(gpQuestions.filter(gq => gq.questionId).map(gq => gq.questionId!))
  const availableQuestions = allQuestions.filter(q => !assignedQuestionIds.has(q.id))

  return (
    <GPQuestionsClient
      grandPrixId={grandPrixId}
      gpQuestions={gpQuestions}
      availableQuestions={availableQuestions}
      focusPilot={grandPrix?.focusPilot}
      focusPilotContext={grandPrix?.focusPilotContext}
    />
  )
}