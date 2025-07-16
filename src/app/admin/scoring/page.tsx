import { Suspense } from "react"
import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { ScoringDashboard } from "./scoring-dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = 'force-dynamic'
export const maxDuration = 800

function ScoringDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}

export default async function ScoringPage() {
  const session = await auth()
  
  if (!session?.user?.role || session.user.role !== "superadmin") {
    notFound()
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Procesamiento de Puntuación</h1>
        <p className="text-muted-foreground">
          Calcula los puntos de las predicciones basándose en los resultados oficiales
        </p>
      </div>
      
      <Suspense fallback={<ScoringDashboardSkeleton />}>
        <ScoringDashboard />
      </Suspense>
    </div>
  )
}