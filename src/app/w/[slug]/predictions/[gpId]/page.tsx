import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getWorkspaceBySlug, isUserInWorkspace } from '@/services/workspace-service'
import { PredictionTable } from './prediction-table'
import { PredictionTableSkeleton } from './prediction-table-skeleton'

export default async function PredictionGPPage({
  params
}: {
  params: Promise<{ slug: string; gpId: string }>
}) {
  const { slug, gpId } = await params
  const session = await auth()
  if (!session?.user) {
    notFound()
  }

  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) {
    notFound()
  }

  // Verificar que el usuario pertenece al workspace
  const isUserMember = await isUserInWorkspace(session.user.id, workspace.id)
  if (!isUserMember) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Suspense fallback={<PredictionTableSkeleton />}>
        <PredictionTable 
          gpId={gpId} 
          userId={session.user.id}
          workspaceSlug={slug}
        />
      </Suspense>
    </div>
  )
}