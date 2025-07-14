import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* General Settings Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-40" />
          </div>
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>

          <div className="flex justify-end">
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone Skeleton */}
      <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}