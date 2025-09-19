import { Suspense } from 'react'
import { PredictionsList } from './predictions-list'
import { PredictionsListSkeleton } from './predictions-list-skeleton'

export default async function PredictionsPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <Suspense fallback={<PredictionsListSkeleton />}>
      <PredictionsList slug={slug} />
    </Suspense>
  )
}