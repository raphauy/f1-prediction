import { put, del } from '@vercel/blob'
import { z } from 'zod'

// Esquemas de validación
export const uploadImageSchema = z.object({
  file: z.any(), // File object del navegador
  userId: z.string().min(1, "ID de usuario requerido"),
  folder: z.string().optional().default("avatars")
})

export const uploadWorkspaceImageSchema = z.object({
  file: z.any(), // File object del navegador
  workspaceId: z.string().min(1, "ID de workspace requerido"),
  folder: z.string().default("workspaces")
})

export const deleteImageSchema = z.object({
  url: z.string().url("URL de imagen inválida")
})

// Tipos
export type UploadImageInput = z.infer<typeof uploadImageSchema>
export type UploadWorkspaceImageInput = z.infer<typeof uploadWorkspaceImageSchema>
export type DeleteImageInput = z.infer<typeof deleteImageSchema>

/**
 * Sube una imagen de avatar de usuario a Vercel Blob Storage
 */
export async function uploadUserAvatar(input: UploadImageInput) {
  const validatedInput = uploadImageSchema.parse(input)
  
  // Validar que sea un archivo de imagen
  if (!validatedInput.file || !validatedInput.file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen')
  }
  
  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (validatedInput.file.size > maxSize) {
    throw new Error('La imagen no puede ser mayor a 5MB')
  }
  
  try {
    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const fileExtension = validatedInput.file.name.split('.').pop() || 'jpg'
    const fileName = `${validatedInput.folder}/${validatedInput.userId}-${timestamp}.${fileExtension}`
    
    // Subir archivo a Vercel Blob
    const blob = await put(fileName, validatedInput.file, {
      access: 'public',
      addRandomSuffix: false, // Ya tenemos timestamp para evitar colisiones
    })
    
    return {
      url: blob.url,
      fileName: fileName,
      size: validatedInput.file.size,
      contentType: validatedInput.file.type
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    throw new Error('Error al subir la imagen')
  }
}

/**
 * Elimina una imagen de Vercel Blob Storage
 */
export async function deleteImage(input: DeleteImageInput) {
  const validatedInput = deleteImageSchema.parse(input)
  
  try {
    await del(validatedInput.url)
    return { success: true }
  } catch (error) {
    console.error('Error deleting image:', error)
    throw new Error('Error al eliminar la imagen')
  }
}

/**
 * Elimina la imagen de avatar anterior de un usuario y sube una nueva
 */
export async function replaceUserAvatar(input: UploadImageInput & { currentImageUrl?: string }) {
  const validatedInput = uploadImageSchema.parse(input)
  
  try {
    // Subir nueva imagen
    const newImage = await uploadUserAvatar(validatedInput)
    
    // Eliminar imagen anterior si existe
    if (input.currentImageUrl) {
      try {
        await deleteImage({ url: input.currentImageUrl })
      } catch (error) {
        // No fallar si no se puede eliminar la imagen anterior
        console.warn('Could not delete previous image:', error)
      }
    }
    
    return newImage
  } catch (error) {
    console.error('Error replacing user avatar:', error)
    throw new Error('Error al reemplazar la imagen de avatar')
  }
}

/**
 * Sube una imagen de workspace a Vercel Blob Storage
 */
export async function uploadWorkspaceImage(input: UploadWorkspaceImageInput) {
  const validatedInput = uploadWorkspaceImageSchema.parse(input)
  
  // Validar que sea un archivo de imagen
  if (!validatedInput.file || !validatedInput.file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen')
  }
  
  // Validar tamaño (máximo 2MB para workspace)
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (validatedInput.file.size > maxSize) {
    throw new Error('La imagen no puede ser mayor a 2MB')
  }
  
  try {
    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const fileExtension = validatedInput.file.name.split('.').pop() || 'jpg'
    const fileName = `${validatedInput.folder}/${validatedInput.workspaceId}-${timestamp}.${fileExtension}`
    
    // Subir archivo a Vercel Blob
    const blob = await put(fileName, validatedInput.file, {
      access: 'public',
      addRandomSuffix: false, // Ya tenemos timestamp para evitar colisiones
    })
    
    return {
      url: blob.url,
      fileName: fileName,
      size: validatedInput.file.size,
      contentType: validatedInput.file.type
    }
  } catch (error) {
    console.error('Error uploading workspace image:', error)
    throw new Error('Error al subir la imagen del workspace')
  }
}

/**
 * Elimina la imagen anterior de un workspace y sube una nueva
 */
export async function replaceWorkspaceImage(input: UploadWorkspaceImageInput & { currentImageUrl?: string }) {
  const validatedInput = uploadWorkspaceImageSchema.parse(input)
  
  try {
    // Subir nueva imagen
    const newImage = await uploadWorkspaceImage(validatedInput)
    
    // Eliminar imagen anterior si existe
    if (input.currentImageUrl) {
      try {
        await deleteImage({ url: input.currentImageUrl })
      } catch (error) {
        // No fallar si no se puede eliminar la imagen anterior
        console.warn('Could not delete previous workspace image:', error)
      }
    }
    
    return newImage
  } catch (error) {
    console.error('Error replacing workspace image:', error)
    throw new Error('Error al reemplazar la imagen del workspace')
  }
}