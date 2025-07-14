"use server"

import { auth } from "@/lib/auth"
import { updateUser } from "@/services/user-service"
import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"

interface CompleteOnboardingInput {
  name: string
  image?: string | null
}

export async function completeOnboardingAction(input: CompleteOnboardingInput) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { success: false, error: "No estás autenticado" }
    }

    const result = await updateUser(session.user.id, {
      name: input.name,
      image: input.image,
      isOnboarded: true
    })

    if (!result) {
      return { success: false, error: "Error al actualizar el usuario" }
    }

    // Revalidar rutas que podrían mostrar información del usuario
    revalidatePath("/admin")
    revalidatePath("/w")

    return { success: true, message: "Perfil completado exitosamente" }

  } catch (error) {
    console.error("Error completing onboarding:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al completar el perfil"
    }
  }
}

export async function uploadProfileImageAction(formData: FormData) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { success: false, error: "No estás autenticado" }
    }

    const file = formData.get("file") as File
    
    if (!file) {
      return { success: false, error: "No se encontró el archivo" }
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "La imagen debe ser menor a 5MB" }
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "El archivo debe ser una imagen" }
    }

    // Generar nombre único para el archivo
    const fileExtension = file.name.split(".").pop() || "jpg"
    const fileName = `profile-images/${session.user.id}-${Date.now()}.${fileExtension}`

    // Subir a Vercel Blob Storage
    const blob = await put(fileName, file, {
      access: "public",
    })

    if (!blob.url) {
      return { success: false, error: "Error al subir la imagen" }
    }

    return { 
      success: true, 
      imageUrl: blob.url,
      message: "Imagen subida correctamente"
    }

  } catch (error) {
    console.error("Error uploading profile image:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al subir la imagen"
    }
  }
}