import { notFound } from 'next/navigation'
import { getSeasonById } from '@/services/season-service'
import { SeasonForm } from '../../season-form'

interface EditSeasonPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditSeasonPage({ params }: EditSeasonPageProps) {
  const { id } = await params
  const season = await getSeasonById(id)
  
  if (!season) {
    notFound()
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Temporada</h1>
        <p className="text-muted-foreground">
          Modifica la configuración de la temporada {season.year}
        </p>
      </div>

      <SeasonForm season={season} />
    </div>
  )
}