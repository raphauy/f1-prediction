import { QuestionTemplateForm } from '../question-template-form'

export default function NewQuestionTemplatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nueva Plantilla de Pregunta</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Crea una nueva plantilla reutilizable para categorías Clásica o Strollómetro
        </p>
      </div>

      <div className="max-w-2xl">
        <QuestionTemplateForm />
      </div>
    </div>
  )
}