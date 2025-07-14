"use client"

import { useState } from "react"
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
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { MoreHorizontal, Send, Trash2, Loader2 } from "lucide-react"
import { cancelInvitationAction, resendInvitationAction } from "./actions"

interface PendingInvitationActionsClientProps {
  invitation: {
    id: string
    email: string
  }
  workspaceSlug: string
}

export function PendingInvitationActionsClient({ 
  invitation, 
  workspaceSlug 
}: PendingInvitationActionsClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [isCanceling, setIsCanceling] = useState(false)

  const handleCancel = async () => {
    setIsCanceling(true)

    try {
      const formData = new FormData()
      formData.set("invitationId", invitation.id)
      formData.set("workspaceSlug", workspaceSlug)

      const result = await cancelInvitationAction(formData)
      
      if (result.success) {
        toast.success(result.message)
        setShowCancelDialog(false)
      } else {
        toast.error(result.error)
      }

    } catch (error: unknown) {
      console.error("Error canceling invitation:", error)
      toast.error(error instanceof Error ? error.message : "Error al cancelar la invitación")
    } finally {
      setIsCanceling(false)
    }
  }

  const handleResend = async () => {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.set("invitationId", invitation.id)
      formData.set("workspaceSlug", workspaceSlug)

      const result = await resendInvitationAction(formData)
      
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error)
      }

    } catch (error: unknown) {
      console.error("Error resending invitation:", error)
      toast.error(error instanceof Error ? error.message : "Error al reenviar la invitación")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleResend} disabled={isLoading}>
          <Send className="h-4 w-4 mr-2" />
          Reenviar
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setShowCancelDialog(true)} 
          disabled={isLoading}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Cancelar
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Dialog de confirmación para cancelar */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cancelar invitación?</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres cancelar la invitación para{" "}
              <span className="font-medium">{invitation.email}</span>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isCanceling}
            >
              No, mantener
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isCanceling}
            >
              {isCanceling ? "Cancelando..." : "Sí, cancelar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  )
}