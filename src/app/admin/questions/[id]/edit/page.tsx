import { getQuestionById } from '@/services/question-service'
import { QuestionForm } from '../../question-form'
import { notFound } from 'next/navigation'

interface EditQuestionPageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuestionPage({ params }: EditQuestionPageProps) {
  const { id } = await params
  const question = await getQuestionById(id)

  if (!question) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar Pregunta</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Modifica los detalles de la pregunta
        </p>
      </div>

      <div className="max-w-2xl">
        <QuestionForm question={question} />
      </div>
    </div>
  )
}