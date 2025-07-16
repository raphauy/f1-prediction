import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ExternalLink } from "lucide-react"
import Link from "next/link"
import { WorkspacesList } from "./workspaces-list"
import { WorkspacesTableSkeleton } from "./workspaces-table-skeleton"

export const dynamic = 'force-dynamic'

export default function WorkspacesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Juegos</h2>
          <p className="text-muted-foreground">
            Administra los juegos del sistema y sus participantes
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/w">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Todos
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/workspaces/new">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Juego
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Juegos</CardTitle>
          <CardDescription>
            Todos los juegos creados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<WorkspacesTableSkeleton />}>
            <WorkspacesList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}