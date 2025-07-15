import { Suspense } from 'react'
import { QuestionsList } from './questions-list'
import { QuestionsSkeleton } from './questions-skeleton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function QuestionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Biblioteca de Preguntas</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona las preguntas estándar para las predicciones
          </p>
        </div>
        <Link href="/admin/questions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Pregunta
          </Button>
        </Link>
      </div>

      <Suspense fallback={<QuestionsSkeleton />}>
        <QuestionsList />
      </Suspense>
    </div>
  )
}