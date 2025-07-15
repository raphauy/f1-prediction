import { Suspense } from 'react'
import { PredictionsRedirect } from './predictions-redirect'
import { Skeleton } from '@/components/ui/skeleton'

export default async function PredictionsPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <Suspense 
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      }
    >
      <PredictionsRedirect slug={slug} />
    </Suspense>
  )
}