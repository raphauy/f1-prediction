import { getGPQuestions } from '@/services/question-service'
import { getGrandPrixById } from '@/services/grand-prix-service'
import { getAllQuestionTemplates } from '@/services/question-template-service'
import { GPQuestionsClient } from './gp-questions-client'

interface GPQuestionsManagerProps {
  grandPrixId: string
}

export async function GPQuestionsManager({ grandPrixId }: GPQuestionsManagerProps) {
  const [gpQuestions, templates, grandPrix] = await Promise.all([
    getGPQuestions(grandPrixId),
    getAllQuestionTemplates(),
    getGrandPrixById(grandPrixId),
  ])

  return (
    <GPQuestionsClient
      grandPrixId={grandPrixId}
      gpQuestions={gpQuestions}
      templates={templates}
      focusPilot={grandPrix?.focusPilot}
      focusPilotContext={grandPrix?.focusPilotContext}
    />
  )
}