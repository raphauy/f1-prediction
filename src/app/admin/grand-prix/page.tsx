import { Suspense } from 'react'
import { GrandPrixList } from './grand-prix-list'
import { GrandPrixSkeleton } from './grand-prix-skeleton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function GrandPrixPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Grand Prix</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona las carreras de todas las temporadas
          </p>
        </div>
        <Link href="/admin/grand-prix/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Grand Prix
          </Button>
        </Link>
      </div>

      <Suspense fallback={<GrandPrixSkeleton />}>
        <GrandPrixList />
      </Suspense>
    </div>
  )
}