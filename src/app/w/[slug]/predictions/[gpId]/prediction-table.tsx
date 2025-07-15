import { notFound } from 'next/navigation'
import { getGPById } from '@/services/grand-prix-service'
import { getGPQuestionsWithUserPredictions, getUserActiveWorkspaceSeasons } from '@/services/prediction-service'
import { PredictionTableClient } from './prediction-table-client'
import { QuestionCategory } from '@prisma/client'

interface PredictionTableProps {
  gpId: string
  userId: string
  workspaceSlug: string
}

export async function PredictionTable({ gpId, userId, workspaceSlug }: PredictionTableProps) {
  // Obtener datos del GP
  const grandPrix = await getGPById(gpId)
  if (!grandPrix) {
    notFound()
  }

  // Verificar deadline
  const now = new Date()
  const isDeadlinePassed = now > grandPrix.qualifyingDate

  // Obtener preguntas con predicciones del usuario
  const questionsWithPredictions = await getGPQuestionsWithUserPredictions(gpId, userId)

  // Organizar preguntas por categoría
  const questionsByCategory = {
    CLASSIC: questionsWithPredictions.filter(q => q.category === QuestionCategory.CLASSIC),
    PILOT_FOCUS: questionsWithPredictions.filter(q => q.category === QuestionCategory.PILOT_FOCUS),
    STROLLOMETER: questionsWithPredictions.filter(q => q.category === QuestionCategory.STROLLOMETER),
  }

  // Contar predicciones realizadas
  const totalQuestions = questionsWithPredictions.length
  const answeredQuestions = questionsWithPredictions.filter(q => q.userPrediction).length

  // Obtener workspaces del usuario
  const userWorkspaceSeasons = await getUserActiveWorkspaceSeasons(userId)
  const userWorkspaceCount = userWorkspaceSeasons.length

  return (
    <PredictionTableClient
      grandPrix={grandPrix}
      questionsByCategory={questionsByCategory}
      totalQuestions={totalQuestions}
      answeredQuestions={answeredQuestions}
      userWorkspaceCount={userWorkspaceCount}
      isDeadlinePassed={isDeadlinePassed}
      workspaceSlug={workspaceSlug}
    />
  )
}