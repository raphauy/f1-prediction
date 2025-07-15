import { getAllGrandPrix } from '@/services/grand-prix-service'
import { getAllSeasons } from '@/services/season-service'
import { GrandPrixTableClient } from './grand-prix-table-client'
import { UpcomingDeadlinesBanner } from './upcoming-deadlines-banner'

export async function GrandPrixList() {
  const [grandPrix, seasons] = await Promise.all([
    getAllGrandPrix(),
    getAllSeasons(),
  ])

  return (
    <div className="space-y-4">
      <UpcomingDeadlinesBanner grandPrix={grandPrix} />
      <GrandPrixTableClient 
        grandPrix={grandPrix} 
        seasons={seasons}
      />
    </div>
  )
}