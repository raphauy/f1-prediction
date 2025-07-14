import { Suspense } from "react"
import { WorkspaceDashboard } from "./workspace-dashboard"
import { WorkspaceDashboardSkeleton } from "./workspace-dashboard-skeleton"

interface WorkspacePageProps {
  params: Promise<{ slug: string }>
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { slug } = await params

  return (
    <div className="space-y-6">
      <Suspense fallback={<WorkspaceDashboardSkeleton />}>
        <WorkspaceDashboard slug={slug} />
      </Suspense>
    </div>
  )
}