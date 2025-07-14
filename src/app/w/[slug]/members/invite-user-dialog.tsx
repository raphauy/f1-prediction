"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus, Loader2, Mail, UserCheck } from "lucide-react"
import { WorkspaceRole } from "@prisma/client"
import { createInvitationAction } from "./actions"

interface InviteUserDialogProps {
  workspaceId: string
  workspaceSlug: string
}

export function InviteUserDialog({ workspaceId, workspaceSlug }: InviteUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen)
      if (!newOpen) {
        setIsLoading(false) // Reset loading state when closing
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    
    if (!email?.trim()) {
      toast.error("Por favor ingresa un email")
      return
    }

    setIsLoading(true)

    try {
      // Agregar datos adicionales al FormData
      formData.set("workspaceId", workspaceId)
      formData.set("workspaceSlug", workspaceSlug)

      const result = await createInvitationAction(formData)
      
      if (result.success) {
        toast.success(result.message)
        handleOpenChange(false)
      } else {
        toast.error(result.error)
      }

    } catch (error: unknown) {
      console.error("Error sending invitation:", error)
      toast.error(error instanceof Error ? error.message : "Error al enviar la invitación")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Invitar Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invitar Usuario al Workspace</DialogTitle>
          <DialogDescription>
            Envía una invitación por email para que se una al workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Rol en el workspace
            </Label>
            <Select name="role" defaultValue={WorkspaceRole.member} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={WorkspaceRole.member}>
                  Miembro
                </SelectItem>
                <SelectItem value={WorkspaceRole.admin}>
                  Administrador
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-muted-foreground space-y-1">
              <div><strong>Miembro:</strong> Puede ver y participar en el workspace</div>
              <div><strong>Administrador:</strong> Puede gestionar usuarios, configuración e invitaciones</div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Invitación
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}