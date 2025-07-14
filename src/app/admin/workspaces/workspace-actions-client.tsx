"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Users } from "lucide-react"
import { deleteWorkspaceAction } from "@/app/admin/workspaces/actions"
import { toast } from "sonner"
import Link from "next/link"

type Workspace = {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: Date
  updatedAt: Date
  _count: {
    users: number
  }
}

interface WorkspaceActionsClientProps {
  workspace: Workspace
}

export function WorkspaceActionsClient({ workspace }: WorkspaceActionsClientProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteWorkspace = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteWorkspaceAction(workspace.id)
      if (result.success) {
        toast.success(result.message)
        setShowDeleteDialog(false)
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error eliminando workspace")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Ver usuarios */}
        <DropdownMenuItem asChild>
          <Link href={`/w/${workspace.slug}/members`}>
            <Users className="mr-2 h-4 w-4" />
            Ver Usuarios ({workspace._count.users})
          </Link>
        </DropdownMenuItem>
        
        {/* Editar workspace */}
        <DropdownMenuItem asChild>
          <Link href={`/admin/workspaces/${workspace.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {/* Eliminar workspace */}
        <DropdownMenuItem
          onClick={() => setShowDeleteDialog(true)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Dialog de confirmación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar workspace?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar el workspace <strong>{workspace.name}</strong>? 
              Esta acción eliminará todos los datos asociados y no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteWorkspace}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  )
}