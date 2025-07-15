import { Suspense } from "react"
import { WorkspaceList } from "./workspace-list"
import { WorkspaceListSkeleton } from "./workspace-list-skeleton"

export default function WorkspacesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Juegos</h1>
        <p className="text-muted-foreground">
          Participa en competencias de predicciones con tus amigos
        </p>
      </div>

      <Suspense fallback={<WorkspaceListSkeleton />}>
        <WorkspaceList />
      </Suspense>
    </div>
  )
}