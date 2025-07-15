import { getAllQuestions } from '@/services/question-service'
import { QuestionsTableClient } from './questions-table-client'

export async function QuestionsList() {
  const questions = await getAllQuestions()

  return <QuestionsTableClient questions={questions} />
}