import { notFound } from 'next/navigation'
import { getGrandPrixById } from '@/services/grand-prix-service'
import { getAllSeasons } from '@/services/season-service'
import { GrandPrixForm } from '../../grand-prix-form'

export default async function EditGrandPrixPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [grandPrix, seasons] = await Promise.all([
    getGrandPrixById(id),
    getAllSeasons(),
  ])

  if (!grandPrix) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar Grand Prix</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Modifica los detalles de {grandPrix.name}
        </p>
      </div>

      <div className="max-w-2xl">
        <GrandPrixForm grandPrix={grandPrix} seasons={seasons} />
      </div>
    </div>
  )
}