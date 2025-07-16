import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getGrandPrixById } from '@/services/grand-prix-service'
import { GPQuestionsManager } from './gp-questions-manager'
import { GPQuestionsSkeleton } from './gp-questions-skeleton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function GPQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const grandPrix = await getGrandPrixById(id)

  if (!grandPrix) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/grand-prix">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Volver
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold">Configurar Preguntas</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {grandPrix.name} - {grandPrix.season?.name}
          </p>
        </div>
      </div>

      <Suspense fallback={<GPQuestionsSkeleton />}>
        <GPQuestionsManager grandPrixId={id} />
      </Suspense>
    </div>
  )
}