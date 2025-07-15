import { getAllSeasons } from '@/services/season-service'
import { GrandPrixForm } from '../grand-prix-form'

export default async function NewGrandPrixPage() {
  const seasons = await getAllSeasons()

  if (seasons.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Nuevo Grand Prix</h1>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded">
          Debes crear al menos una temporada antes de añadir Grand Prix.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo Grand Prix</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Añade una nueva carrera al calendario
        </p>
      </div>

      <div className="max-w-2xl">
        <GrandPrixForm seasons={seasons} />
      </div>
    </div>
  )
}