import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { WorkspaceForm } from "../workspace-form"

export default function NewWorkspacePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/workspaces">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Nuevo Workspace</h2>
          <p className="text-muted-foreground">
            Crear un nuevo workspace en el sistema
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Workspace</CardTitle>
          <CardDescription>
            Complete los datos para crear un nuevo workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkspaceForm />
        </CardContent>
      </Card>
    </div>
  )
}