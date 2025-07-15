import { QuestionForm } from '../question-form'

export default function NewQuestionPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nueva Pregunta</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Crea una nueva pregunta para las predicciones
        </p>
      </div>

      <div className="max-w-2xl">
        <QuestionForm />
      </div>
    </div>
  )
}