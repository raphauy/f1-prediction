"use server"

import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { getAllUsers, deleteUser } from "@/services/user-service"

export async function getUsersAction() {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    const users = await getAllUsers()

    return { success: true, users }
  } catch (error) {
    console.error("Error obteniendo usuarios:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error obteniendo usuarios" 
    }
  }
}

export async function updateUserRoleAction(userId: string, isSuperadmin: boolean) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    // No permitir que un superadmin se quite a sí mismo los permisos
    if (session.user.id === userId && !isSuperadmin) {
      throw new Error("No puedes cambiar tu propio rol de superadmin")
    }

    const { updateUser } = await import("@/services/user-service")
    await updateUser(userId, { 
      role: isSuperadmin ? "superadmin" : null 
    })

    revalidatePath("/admin/users")
    return { success: true, message: "Rol de usuario actualizado correctamente" }
  } catch (error) {
    console.error("Error actualizando rol:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error actualizando rol" 
    }
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    // No permitir que un admin se elimine a sí mismo
    if (session.user.id === userId) {
      throw new Error("No puedes eliminar tu propia cuenta")
    }

    await deleteUser(userId)

    revalidatePath("/admin/users")
    return { success: true, message: "Usuario eliminado correctamente" }
  } catch (error) {
    console.error("Error eliminando usuario:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error eliminando usuario" 
    }
  }
}

export async function createUserAction(formData: FormData) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== "superadmin") {
      throw new Error("No autorizado")
    }

    const email = formData.get("email") as string
    const name = formData.get("name") as string
    const isSuperadmin = formData.get("role") === "superadmin"

    const { getUserByEmail, createUser } = await import("@/services/user-service")
    
    // Validar que el email no exista
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      throw new Error("Ya existe un usuario con este email")
    }

    // Crear el usuario
    await createUser({
      email,
      name: name || undefined,
      role: isSuperadmin ? "superadmin" : null
    })

    revalidatePath("/admin/users")
    return { success: true, message: "Usuario creado correctamente" }
  } catch (error) {
    console.error("Error creando usuario:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Error creando usuario" 
    }
  }
}