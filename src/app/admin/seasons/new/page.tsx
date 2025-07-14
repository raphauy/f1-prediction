import { SeasonForm } from '../season-form'

export default function NewSeasonPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nueva Temporada</h1>
        <p className="text-muted-foreground">
          Crea una nueva temporada de F1. Se propagará automáticamente a todos los workspaces.
        </p>
      </div>

      <SeasonForm />
    </div>
  )
}