import { Suspense } from "react"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { OfficialResultsTable } from "./official-results-table"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = 'force-dynamic'

function ResultsTableSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function OfficialResultsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  
  if (!session?.user?.role || session.user.role !== "superadmin") {
    notFound()
  }
  
  const { id } = await params
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Suspense fallback={<ResultsTableSkeleton />}>
        <OfficialResultsTable gpId={id} />
      </Suspense>
    </div>
  )
}