import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SeasonsList } from './seasons-list'
import { SeasonsTableSkeleton } from './seasons-skeleton'

export const dynamic = 'force-dynamic'

export default function SeasonsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Temporadas F1</h1>
          <p className="text-muted-foreground">
            Gestiona las temporadas y su configuración global
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/seasons/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Temporada
          </Link>
        </Button>
      </div>

      <Suspense fallback={<SeasonsTableSkeleton />}>
        <SeasonsList />
      </Suspense>
    </div>
  )
}