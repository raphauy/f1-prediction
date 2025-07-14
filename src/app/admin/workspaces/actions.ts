"use server"

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { 
  createWorkspace, 
  updateWorkspace, 
  deleteWorkspace,
  getWorkspaceBySlug,
  type CreateWorkspaceData 
} from "@/services/workspace-service"

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

    await createWorkspace(workspaceData)

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
    return { success: true, message: "Workspace actualizado correctamente" }
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