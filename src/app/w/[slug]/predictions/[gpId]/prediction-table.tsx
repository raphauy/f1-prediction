import { notFound } from 'next/navigation'
import { getGPById, isGrandPrixLocked } from '@/services/grand-prix-service'
import { getGPQuestionsWithUserPredictions, getUserActiveWorkspaceSeasons, getGPQuestionsWithResults } from '@/services/prediction-service'
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

  // Verificar si el GP está bloqueado para predicciones
  const isLocked = await isGrandPrixLocked(gpId)
  const now = new Date()
  const isPastGP = now > grandPrix.raceDate
  const isViewOnly = isLocked || isPastGP || grandPrix.status === 'FINISHED'

  // Obtener preguntas con predicciones y posiblemente resultados oficiales
  let questionsWithPredictions
  if (isViewOnly) {
    // Si es un GP pasado, obtener con resultados oficiales
    questionsWithPredictions = await getGPQuestionsWithResults(gpId, userId)
  } else {
    // Si es un GP activo, obtener solo predicciones
    questionsWithPredictions = await getGPQuestionsWithUserPredictions(gpId, userId)
  }

  // Organizar preguntas por categoría
  const questionsByCategory = {
    CLASSIC: questionsWithPredictions.filter(q => q.category === QuestionCategory.CLASSIC),
    PILOT_FOCUS: questionsWithPredictions.filter(q => q.category === QuestionCategory.PILOT_FOCUS),
    STROLLOMETER: questionsWithPredictions.filter(q => q.category === QuestionCategory.STROLLOMETER),
  }

  // Contar predicciones realizadas
  const totalQuestions = questionsWithPredictions.length
  const answeredQuestions = questionsWithPredictions.filter(q => q.userPrediction).length

  // Contar predicciones correctas si hay resultados oficiales
  let correctPredictions = 0
  let totalPoints = 0
  if (isViewOnly) {
    correctPredictions = questionsWithPredictions.filter(q => 'isCorrect' in q && q.isCorrect === true).length
    // Calcular puntos totales (si hay resultados)
    totalPoints = questionsWithPredictions.reduce((sum, q) => {
      if ('isCorrect' in q && q.isCorrect === true) {
        return sum + q.points
      }
      return sum
    }, 0)
  }

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
      isDeadlinePassed={isLocked}
      workspaceSlug={workspaceSlug}
      isViewOnly={isViewOnly}
      correctPredictions={correctPredictions}
      totalPoints={totalPoints}
    />
  )
}