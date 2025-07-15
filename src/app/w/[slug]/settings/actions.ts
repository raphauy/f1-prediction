'use server'

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  updateWorkspace,
  updateWorkspaceImage,
  deleteWorkspace,
  getWorkspaceBySlug,
  isUserWorkspaceAdmin,
} from '@/services/workspace-service'
import {
  replaceWorkspaceImage,
  deleteImage,
} from '@/services/upload-service'

export async function updateWorkspaceAction(slug: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('No autorizado')
  }

  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) {
    throw new Error('Workspace no encontrado')
  }

  const isAdmin = await isUserWorkspaceAdmin(session.user.id, workspace.id)
  if (!isAdmin) {
    throw new Error('No tienes permisos para editar este workspace')
  }

  try {
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
    }

    await updateWorkspace(workspace.id, data)
    
    revalidatePath(`/w/${slug}/settings`)
    revalidatePath(`/w/${slug}`)
  } catch (error) {
    console.error('Error updating workspace:', error)
    throw new Error('Error al actualizar el workspace')
  }
}

export async function uploadWorkspaceImageAction(slug: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('No autorizado')
  }

  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) {
    throw new Error('Workspace no encontrado')
  }

  const isAdmin = await isUserWorkspaceAdmin(session.user.id, workspace.id)
  if (!isAdmin) {
    throw new Error('No tienes permisos para editar este workspace')
  }

  try {
    const file = formData.get('image') as File
    if (!file || file.size === 0) {
      throw new Error('No se proporcionó ninguna imagen')
    }

    // Subir nueva imagen y eliminar la anterior si existe
    const result = await replaceWorkspaceImage({
      file,
      workspaceId: workspace.id,
      folder: 'workspaces',
      currentImageUrl: workspace.image || undefined,
    })

    // Actualizar la URL de la imagen en la base de datos
    await updateWorkspaceImage(workspace.id, result.url)
    
    revalidatePath(`/w/${slug}/settings`)
    revalidatePath(`/w/${slug}`)
    revalidatePath('/w')
    
    return { success: true, url: result.url }
  } catch (error) {
    console.error('Error uploading workspace image:', error)
    throw new Error('Error al subir la imagen del workspace')
  }
}

export async function deleteWorkspaceImageAction(slug: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('No autorizado')
  }

  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) {
    throw new Error('Workspace no encontrado')
  }

  const isAdmin = await isUserWorkspaceAdmin(session.user.id, workspace.id)
  if (!isAdmin) {
    throw new Error('No tienes permisos para editar este workspace')
  }

  try {
    // Eliminar imagen de Vercel Blob si existe
    if (workspace.image) {
      try {
        await deleteImage({ url: workspace.image })
      } catch (error) {
        console.warn('Could not delete workspace image from storage:', error)
      }
    }

    // Actualizar la base de datos
    await updateWorkspaceImage(workspace.id, null)
    
    revalidatePath(`/w/${slug}/settings`)
    revalidatePath(`/w/${slug}`)
    revalidatePath('/w')
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting workspace image:', error)
    throw new Error('Error al eliminar la imagen del workspace')
  }
}

export async function deleteWorkspaceAction(slug: string) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('No autorizado')
  }

  const workspace = await getWorkspaceBySlug(slug)
  if (!workspace) {
    throw new Error('Workspace no encontrado')
  }

  const isAdmin = await isUserWorkspaceAdmin(session.user.id, workspace.id)
  if (!isAdmin) {
    throw new Error('No tienes permisos para eliminar este workspace')
  }

  try {
    // Eliminar imagen si existe
    if (workspace.image) {
      try {
        await deleteImage({ url: workspace.image })
      } catch (error) {
        console.warn('Could not delete workspace image:', error)
      }
    }

    await deleteWorkspace(workspace.id)
    
    redirect('/w')
  } catch (error) {
    console.error('Error deleting workspace:', error)
    throw new Error('Error al eliminar el juego')
  }
}