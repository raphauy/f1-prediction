import { getAllQuestionTemplates } from '@/services/question-template-service'
import { QuestionTemplatesTableClient } from './question-templates-table-client'

export async function QuestionTemplatesList() {
  const templates = await getAllQuestionTemplates()

  return <QuestionTemplatesTableClient templates={templates} />
}