"use client"

import { deleteUserAction, updateUserRoleAction } from "@/app/admin/users/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Shield, Trash2, User } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { toast } from "sonner"

type User = {
  id: string
  email: string
  name: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}

interface UserActionsClientProps {
  user: User
}

export function UserActionsClient({ user }: UserActionsClientProps) {
  const { data: session } = useSession()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleRoleChange = async (userId: string, isSuperadmin: boolean) => {
    try {
      const result = await updateUserRoleAction(userId, isSuperadmin)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error actualizando rol")
    }
  }

  const handleDeleteUser = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteUserAction(user.id)
      if (result.success) {
        toast.success(result.message)
        setShowDeleteDialog(false)
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error eliminando usuario")
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
        
        {/* Cambiar rol */}
        {user.role !== "superadmin" ? (
          <DropdownMenuItem
            onClick={() => handleRoleChange(user.id, true)}
          >
            <Shield className="mr-2 h-4 w-4" />
            Hacer Superadmin
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => handleRoleChange(user.id, false)}
            disabled={session?.user?.id === user.id}
          >
            <User className="mr-2 h-4 w-4" />
            Quitar Superadmin
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        {/* Eliminar usuario */}
        <DropdownMenuItem
          onClick={() => setShowDeleteDialog(true)}
          disabled={session?.user?.id === user.id}
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
            <DialogTitle>¿Eliminar usuario?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.
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
              onClick={handleDeleteUser}
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