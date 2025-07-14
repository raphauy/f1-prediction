import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users } from "lucide-react"
import { getAllWorkspaces } from "@/services/workspace-service"
import { WorkspaceActionsClient } from "./workspace-actions-client"

export async function WorkspacesList() {
  const workspaces = await getAllWorkspaces()

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workspace</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Usuarios</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Última actividad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workspaces.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No hay workspaces creados
                </TableCell>
              </TableRow>
            ) : (
              workspaces.map((workspace) => (
                <TableRow key={workspace.id}>
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <div className="font-medium">{workspace.name}</div>
                      {workspace.description && (
                        <div className="text-sm text-muted-foreground">
                          {workspace.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {workspace.slug}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{workspace._count.users}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(workspace.createdAt)}</TableCell>
                  <TableCell>{formatDate(workspace.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <WorkspaceActionsClient workspace={workspace} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Total: {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}