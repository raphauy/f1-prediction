import { Suspense } from 'react'
import { QuestionTemplatesList } from './question-templates-list'
import { QuestionTemplatesSkeleton } from './question-templates-skeleton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function QuestionTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plantillas de Preguntas</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona las plantillas reutilizables para categorías Clásica y Strollómetro
          </p>
        </div>
        <Link href="/admin/question-templates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Plantilla
          </Button>
        </Link>
      </div>

      <Suspense fallback={<QuestionTemplatesSkeleton />}>
        <QuestionTemplatesList />
      </Suspense>
    </div>
  )
}