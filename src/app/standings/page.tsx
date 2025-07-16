import { Suspense } from "react"
import { GlobalStandingsData } from "./global-standings-data"
import { GlobalStandingsSkeleton } from "./global-standings-skeleton"
import { Trophy } from "lucide-react"

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    sort?: string
    minGames?: string
  }>
}

export default async function GlobalStandingsPage({ searchParams }: PageProps) {
  const searchParamsData = await searchParams
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold">Clasificación Global</h1>
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-muted-foreground text-lg">
            Ranking de todos los competidores en todos los juegos
          </p>
        </div>

        <Suspense 
          key={JSON.stringify(searchParams)}
          fallback={<GlobalStandingsSkeleton />}
        >
          <GlobalStandingsData searchParams={searchParamsData} />
        </Suspense>
      </div>
    </div>
  )
}