"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { 
  createWorkspaceInvitation, 
  cancelWorkspaceInvitation, 
  resendWorkspaceInvitation 
} from "@/services/invitation-service"
import { 
  isUserWorkspaceAdmin, 
  updateUserWorkspaceRole, 
  removeUserFromWorkspace,
  getWorkspaceBySlug 
} from "@/services/workspace-service"
import { WorkspaceRole } from "@prisma/client"

/**
 * Server Action para crear una nueva invitación
 */
export async function createInvitationAction(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { success: false, error: "No autenticado" }
  }

  const email = formData.get("email") as string
  const role = (formData.get("role") as WorkspaceRole) || WorkspaceRole.member
  const workspaceId = formData.get("workspaceId") as string
  const workspaceSlug = formData.get("workspaceSlug") as string

  if (!email || !workspaceId) {
    return { success: false, error: "Email y workspace requeridos" }
  }

  try {
    // Verificar que el usuario es admin del workspace
    const isAdmin = await isUserWorkspaceAdmin(session.user.id, workspaceId)
    if (!isAdmin) {
      return { success: false, error: "Solo los administradores pueden enviar invitaciones" }
    }

    // Crear invitación
    const invitationResult = await createWorkspaceInvitation({
      email: email.toLowerCase().trim(),
      workspaceId,
      role,
      invitedById: session.user.id,
      expiresInDays: 7
    })

    if (!invitationResult.success) {
      return { success: false, error: invitationResult.error }
    }

    // Revalidar la página de miembros
    revalidatePath(`/w/${workspaceSlug}/members`)
    
    return { success: true, message: "Invitación enviada correctamente" }

  } catch (error: unknown) {
    console.error("Error creating invitation:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al enviar la invitación" 
    }
  }
}

/**
 * Server Action para cancelar una invitación
 */
export async function cancelInvitationAction(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { success: false, error: "No autenticado" }
  }

  const invitationId = formData.get("invitationId") as string
  const workspaceSlug = formData.get("workspaceSlug") as string

  if (!invitationId) {
    return { success: false, error: "ID de invitación requerido" }
  }

  try {
    // Cancelar invitación
    const result = await cancelWorkspaceInvitation(invitationId, session.user.id)

    if (!result.success) {
      return { success: false, error: result.error }
    }

    // Revalidar la página de miembros
    revalidatePath(`/w/${workspaceSlug}/members`)
    
    return { success: true, message: "Invitación cancelada correctamente" }

  } catch (error: unknown) {
    console.error("Error canceling invitation:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al cancelar la invitación" 
    }
  }
}

/**
 * Server Action para reenviar una invitación
 */
export async function resendInvitationAction(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { success: false, error: "No autenticado" }
  }

  const invitationId = formData.get("invitationId") as string
  const workspaceSlug = formData.get("workspaceSlug") as string

  if (!invitationId) {
    return { success: false, error: "ID de invitación requerido" }
  }

  try {
    // Reenviar invitación
    const result = await resendWorkspaceInvitation({
      invitationId,
      invitedById: session.user.id
    })

    if (!result.success) {
      return { success: false, error: result.error }
    }

    // Revalidar la página de miembros
    revalidatePath(`/w/${workspaceSlug}/members`)
    
    return { success: true, message: "Invitación reenviada correctamente" }

  } catch (error: unknown) {
    console.error("Error resending invitation:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al reenviar la invitación" 
    }
  }
}

/**
 * Server Action para cambiar el rol de un miembro del workspace
 */
export async function updateMemberRoleAction(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { success: false, error: "No autenticado" }
  }

  const userId = formData.get("userId") as string
  const role = formData.get("role") as WorkspaceRole
  const workspaceSlug = formData.get("workspaceSlug") as string

  if (!userId || !role || !workspaceSlug) {
    return { success: false, error: "Datos requeridos faltantes" }
  }

  // Validar que el rol sea válido
  if (!["admin", "member"].includes(role)) {
    return { success: false, error: "Rol inválido" }
  }

  try {
    // Obtener workspace
    const workspace = await getWorkspaceBySlug(workspaceSlug)
    if (!workspace) {
      return { success: false, error: "Workspace no encontrado" }
    }

    // Verificar que el usuario actual es admin del workspace o superadmin
    const isAdmin = await isUserWorkspaceAdmin(session.user.id, workspace.id)
    const isSuperadmin = session.user.role === "superadmin"
    
    if (!isAdmin && !isSuperadmin) {
      return { success: false, error: "Solo los administradores pueden cambiar roles" }
    }

    // No permitir auto-gestión
    if (userId === session.user.id) {
      return { success: false, error: "No puedes cambiar tu propio rol" }
    }

    // Actualizar rol
    await updateUserWorkspaceRole(userId, workspace.id, role as WorkspaceRole)

    // Revalidar la página de miembros
    revalidatePath(`/w/${workspaceSlug}/members`)
    
    return { success: true, message: `Rol actualizado a ${role === "admin" ? "Admin" : "Miembro"} correctamente` }

  } catch (error: unknown) {
    console.error("Error updating member role:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al actualizar el rol" 
    }
  }
}

/**
 * Server Action para remover un miembro del workspace
 */
export async function removeMemberAction(formData: FormData) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { success: false, error: "No autenticado" }
  }

  const userId = formData.get("userId") as string
  const workspaceSlug = formData.get("workspaceSlug") as string

  if (!userId || !workspaceSlug) {
    return { success: false, error: "Datos requeridos faltantes" }
  }

  try {
    // Obtener workspace
    const workspace = await getWorkspaceBySlug(workspaceSlug)
    if (!workspace) {
      return { success: false, error: "Workspace no encontrado" }
    }

    // Verificar que el usuario actual es admin del workspace o superadmin
    const isAdmin = await isUserWorkspaceAdmin(session.user.id, workspace.id)
    const isSuperadmin = session.user.role === "superadmin"
    
    if (!isAdmin && !isSuperadmin) {
      return { success: false, error: "Solo los administradores pueden remover miembros" }
    }

    // No permitir auto-gestión
    if (userId === session.user.id) {
      return { success: false, error: "No puedes removerte a ti mismo del workspace" }
    }

    // Remover usuario del workspace
    await removeUserFromWorkspace(userId, workspace.id)

    // Revalidar la página de miembros
    revalidatePath(`/w/${workspaceSlug}/members`)
    
    return { success: true, message: "Usuario removido del workspace correctamente" }

  } catch (error: unknown) {
    console.error("Error removing member:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al remover el usuario" 
    }
  }
}