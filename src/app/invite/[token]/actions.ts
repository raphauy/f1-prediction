"use server"

import { revalidatePath } from "next/cache"
import { acceptWorkspaceInvitation } from "@/services/invitation-service"

interface AcceptInvitationInput {
  token: string
  userId: string
}

/**
 * Server Action para aceptar una invitación de workspace
 */
export async function acceptInvitationAction(input: AcceptInvitationInput) {
  try {
    const result = await acceptWorkspaceInvitation({
      token: input.token,
      userId: input.userId
    })

    if (!result.success) {
      return { success: false, error: result.error }
    }

    // Revalidar paths relacionados
    if (result.data?.workspaceUser?.workspace) {
      revalidatePath(`/w/${result.data.workspaceUser.workspace.slug}`)
      revalidatePath(`/w/${result.data.workspaceUser.workspace.slug}/members`)
    }
    revalidatePath('/w')
    
    return { 
      success: true, 
      data: result.data,
      message: "Invitación aceptada correctamente" 
    }

  } catch (error: unknown) {
    console.error("Error accepting invitation:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al aceptar la invitación" 
    }
  }
}