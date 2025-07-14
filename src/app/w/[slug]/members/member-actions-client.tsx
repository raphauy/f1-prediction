"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Shield, User, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { updateMemberRoleAction, removeMemberAction } from "./actions"

interface MemberActionsClientProps {
  workspaceUser: {
    id: string
    userId: string
    role: string
    user: {
      name: string | null
      email: string
    }
  }
  workspaceSlug: string
  currentUserId: string
}

export function MemberActionsClient({ 
  workspaceUser, 
  workspaceSlug, 
  currentUserId 
}: MemberActionsClientProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // No permitir auto-gestión
  if (workspaceUser.userId === currentUserId) {
    return null
  }

  const isCurrentlyAdmin = workspaceUser.role === "admin"
  const newRole = isCurrentlyAdmin ? "member" : "admin"
  const newRoleText = isCurrentlyAdmin ? "Miembro" : "Admin"

  const handleRoleChange = async () => {
    setIsLoading(true)
    
    try {
      const formData = new FormData()
      formData.append("userId", workspaceUser.userId)
      formData.append("role", newRole)
      formData.append("workspaceSlug", workspaceSlug)

      const result = await updateMemberRoleAction(formData)

      if (result.success) {
        toast.success(`Rol cambiado a ${newRoleText} exitosamente`)
        setShowRoleDialog(false)
        setIsOpen(false)
      } else {
        toast.error(result.error || "Error al cambiar el rol")
      }
    } catch (error) {
      console.error("Error changing role:", error)
      toast.error("Error al cambiar el rol")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveMember = async () => {
    setIsLoading(true)
    
    try {
      const formData = new FormData()
      formData.append("userId", workspaceUser.userId)
      formData.append("workspaceSlug", workspaceSlug)

      const result = await removeMemberAction(formData)

      if (result.success) {
        toast.success("Usuario removido del workspace exitosamente")
        setShowRemoveDialog(false)
        setIsOpen(false)
      } else {
        toast.error(result.error || "Error al remover el usuario")
      }
    } catch (error) {
      console.error("Error removing member:", error)
      toast.error("Error al remover el usuario")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => setShowRoleDialog(true)}
            className="cursor-pointer"
          >
            {isCurrentlyAdmin ? (
              <>
                <User className="mr-2 h-4 w-4" />
                Cambiar a Miembro
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Cambiar a Admin
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowRemoveDialog(true)}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remover del workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog para cambiar rol */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar rol de usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres cambiar el rol de{" "}
              <strong>{workspaceUser.user.name || workspaceUser.user.email}</strong>{" "}
              de{" "}
              <Badge variant={isCurrentlyAdmin ? "default" : "secondary"} className="mx-1">
                {isCurrentlyAdmin ? "Admin" : "Miembro"}
              </Badge>
              {" "}a{" "}
              <Badge variant={!isCurrentlyAdmin ? "default" : "secondary"} className="mx-1">
                {newRoleText}
              </Badge>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRoleDialog(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRoleChange}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cambiando...
                </>
              ) : (
                `Cambiar a ${newRoleText}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para remover usuario */}
      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover usuario del workspace</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres remover a{" "}
              <strong>{workspaceUser.user.name || workspaceUser.user.email}</strong>{" "}
              del workspace? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRemoveDialog(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveMember}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removiendo...
                </>
              ) : (
                "Remover usuario"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}