import { getQuestionTemplateById } from '@/services/question-template-service'
import { QuestionTemplateForm } from '../../question-template-form'
import { notFound } from 'next/navigation'

interface EditQuestionTemplatePageProps {
  params: Promise<{ id: string }>
}

export default async function EditQuestionTemplatePage({ params }: EditQuestionTemplatePageProps) {
  const { id } = await params
  const template = await getQuestionTemplateById(id)

  if (!template) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar Plantilla</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Modifica los detalles de la plantilla
        </p>
      </div>

      <div className="max-w-2xl">
        <QuestionTemplateForm template={template} />
      </div>
    </div>
  )
}