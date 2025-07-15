"use server"

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { 
  createWorkspace, 
  updateWorkspace, 
  deleteWorkspace,
  getWorkspaceBySlug,
  updateWorkspaceImage,
  addUserToWorkspace,
  type CreateWorkspaceData 
} from "@/services/workspace-service"
import { WorkspaceRole } from "@prisma/client"
import {
  replaceWorkspaceImage,
  deleteImage,
} from '@/services/upload-service'
import { getActiveSeason } from "@/services/season-service"
import { prisma } from "@/lib/prisma"

export async function createWorkspaceAction(formData: FormData) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string

    // Validar que el slug no exista
    const existingWorkspace = await getWorkspaceBySlug(slug)
    if (existingWorkspace) {
      throw new Error("Ya existe un workspace con este slug")
    }

    // Crear el workspace
    const workspaceData: CreateWorkspaceData = {
      name,
      slug,
      description: description || undefined
    }

    const newWorkspace = await createWorkspace(workspaceData)

    // Agregar al creador como admin del workspace
    await addUserToWorkspace(
      session.user.id,
      newWorkspace.id,
      WorkspaceRole.admin
    )

    // Asignar la temporada activa al nuevo workspace
    const activeSeason = await getActiveSeason()
    if (activeSeason) {
      await prisma.workspaceSeason.create({
        data: {
          workspaceId: newWorkspace.id,
          seasonId: activeSeason.id,
          isActive: true
        }
      })
    }

    revalidatePath("/admin/workspaces")
    return { success: true, message: "Workspace creado correctamente" }
  } catch (error) {
    console.error("Error creando workspace:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error creando workspace" 
    }
  }
}

export async function updateWorkspaceAction(workspaceId: string, formData: FormData) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const description = formData.get("description") as string

    // Validar que el slug no exista (excepto el actual)
    const existingWorkspace = await getWorkspaceBySlug(slug)
    if (existingWorkspace && existingWorkspace.id !== workspaceId) {
      throw new Error("Ya existe un workspace con este slug")
    }

    // Actualizar el workspace
    await updateWorkspace(workspaceId, {
      name,
      slug,
      description: description || undefined
    })

    revalidatePath("/admin/workspaces")
    revalidatePath(`/w/${slug}`)
    redirect("/admin/workspaces")
  } catch (error) {
    console.error("Error actualizando workspace:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error actualizando workspace" 
    }
  }
}

export async function deleteWorkspaceAction(workspaceId: string) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    await deleteWorkspace(workspaceId)

    revalidatePath("/admin/workspaces")
    return { success: true, message: "Workspace eliminado correctamente" }
  } catch (error) {
    console.error("Error eliminando workspace:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error eliminando workspace" 
    }
  }
}

export async function uploadWorkspaceImageAdminAction(workspaceId: string, formData: FormData) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    const file = formData.get('image') as File
    if (!file || file.size === 0) {
      throw new Error('No se proporcionó ninguna imagen')
    }

    // Obtener workspace actual para ver si tiene imagen
    const { getWorkspaceById } = await import("@/services/workspace-service")
    const workspace = await getWorkspaceById(workspaceId)
    if (!workspace) {
      throw new Error('Workspace no encontrado')
    }

    // Subir nueva imagen y eliminar la anterior si existe
    const result = await replaceWorkspaceImage({
      file,
      workspaceId: workspaceId,
      folder: 'workspaces',
      currentImageUrl: workspace.image || undefined,
    })

    // Actualizar la URL de la imagen en la base de datos
    await updateWorkspaceImage(workspaceId, result.url)
    
    revalidatePath('/admin/workspaces')
    revalidatePath(`/admin/workspaces/${workspaceId}/edit`)
    revalidatePath('/w')
    
    return { success: true, url: result.url, message: "Imagen actualizada correctamente" }
  } catch (error) {
    console.error('Error uploading workspace image:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al subir la imagen" 
    }
  }
}

export async function deleteWorkspaceImageAdminAction(workspaceId: string) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    // Obtener workspace actual
    const { getWorkspaceById } = await import("@/services/workspace-service")
    const workspace = await getWorkspaceById(workspaceId)
    if (!workspace) {
      throw new Error('Workspace no encontrado')
    }

    // Eliminar imagen de Vercel Blob si existe
    if (workspace.image) {
      try {
        await deleteImage({ url: workspace.image })
      } catch (error) {
        console.warn('Could not delete workspace image from storage:', error)
      }
    }

    // Actualizar la base de datos
    await updateWorkspaceImage(workspaceId, null)
    
    revalidatePath('/admin/workspaces')
    revalidatePath(`/admin/workspaces/${workspaceId}/edit`)
    revalidatePath('/w')
    
    return { success: true, message: "Imagen eliminada correctamente" }
  } catch (error) {
    console.error('Error deleting workspace image:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error al eliminar la imagen" 
    }
  }
}