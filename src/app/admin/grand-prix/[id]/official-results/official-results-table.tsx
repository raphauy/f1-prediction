import { notFound } from 'next/navigation'
import { getGrandPrixById } from '@/services/grand-prix-service'
import { getQuestionsWithOfficialResults } from '@/services/official-result-service'
import { OfficialResultsClient } from './official-results-client'
import { QuestionCategory } from '@prisma/client'

interface OfficialResultsTableProps {
  gpId: string
}

export async function OfficialResultsTable({ gpId }: OfficialResultsTableProps) {
  // Obtener datos del GP
  const grandPrix = await getGrandPrixById(gpId)
  if (!grandPrix) {
    notFound()
  }

  // Obtener preguntas con resultados oficiales
  const questions = await getQuestionsWithOfficialResults(gpId)

  // Organizar preguntas por categoría con cast apropiado de options
  const questionsByCategory = {
    CLASSIC: questions.filter(q => q.category === QuestionCategory.CLASSIC).map(q => ({
      ...q,
      options: q.options as Record<string, unknown> | undefined
    })),
    PILOT_FOCUS: questions.filter(q => q.category === QuestionCategory.PILOT_FOCUS).map(q => ({
      ...q,
      options: q.options as Record<string, unknown> | undefined
    })),
    STROLLOMETER: questions.filter(q => q.category === QuestionCategory.STROLLOMETER).map(q => ({
      ...q,
      options: q.options as Record<string, unknown> | undefined
    })),
  }

  // Contar resultados ingresados
  const totalQuestions = questions.length
  const answeredQuestions = questions.filter(q => q.hasResult).length

  return (
    <OfficialResultsClient
      grandPrix={grandPrix}
      questionsByCategory={questionsByCategory}
      totalQuestions={totalQuestions}
      answeredQuestions={answeredQuestions}
    />
  )
}