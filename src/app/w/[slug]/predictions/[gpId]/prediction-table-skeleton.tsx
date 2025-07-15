import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function PredictionTableSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-96" />
        <Skeleton className="h-6 w-64" />
      </div>

      {/* Progress skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-2 w-full max-w-md" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Table sections skeleton */}
      {[1, 2, 3].map((section) => (
        <Card key={section}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((row) => (
                <div key={row} className="flex items-center justify-between py-3 border-b">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-96" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}