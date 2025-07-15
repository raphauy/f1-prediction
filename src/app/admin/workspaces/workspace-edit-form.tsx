'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Settings, AlertTriangle, Upload, Image as ImageIcon } from "lucide-react"
import { toast } from 'sonner'
import { WorkspaceAvatar } from "@/components/workspace-avatar"
import { 
  updateWorkspaceAction, 
  uploadWorkspaceImageAdminAction, 
  deleteWorkspaceImageAdminAction,
  deleteWorkspaceAction 
} from './actions'

interface WorkspaceEditFormProps {
  workspace: {
    id: string
    slug: string
    name: string
    description: string | null
    image: string | null
  }
}

export function WorkspaceEditForm({ workspace }: WorkspaceEditFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false)

  const handleUpdateWorkspace = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsUpdating(true)

    const formData = new FormData(event.currentTarget)

    try {
      await updateWorkspaceAction(workspace.id, formData)
    } catch {
      toast.error('Error al actualizar el juego')
      setIsUpdating(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const result = await uploadWorkspaceImageAdminAction(workspace.id, formData)
      if (result.success) {
        toast.success(result.message)
        // Recargar la página para ver la nueva imagen
        window.location.reload()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Error al subir la imagen')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!confirm('¿Estás seguro de eliminar la imagen del workspace?')) return

    setIsUploadingImage(true)
    try {
      const result = await deleteWorkspaceImageAdminAction(workspace.id)
      if (result.success) {
        toast.success(result.message)
        // Recargar la página para actualizar la vista
        window.location.reload()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error('Error al eliminar la imagen')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleDeleteWorkspace = async () => {
    if (!confirm(`¿Estás seguro de eliminar el juego "${workspace.name}"? Esta acción no se puede deshacer.`)) {
      return
    }

    setIsDeletingWorkspace(true)
    try {
      const result = await deleteWorkspaceAction(workspace.id)
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.error)
        setIsDeletingWorkspace(false)
      }
    } catch {
      toast.error('Error al eliminar el juego')
      setIsDeletingWorkspace(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configuración General</span>
          </CardTitle>
          <CardDescription>
            Información básica del juego
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateWorkspace} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input 
                  id="name"
                  name="name"
                  defaultValue={workspace.name}
                  placeholder="Nombre del juego"
                  required
                  disabled={isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input 
                  id="slug"
                  name="slug"
                  defaultValue={workspace.slug}
                  placeholder="juego-slug"
                  pattern="^[a-z0-9-]+$"
                  title="Solo letras minúsculas, números y guiones"
                  required
                  disabled={isUpdating}
                />
                <p className="text-xs text-muted-foreground">
                  Solo letras minúsculas, números y guiones
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea 
                id="description"
                name="description"
                defaultValue={workspace.description || ""}
                placeholder="Descripción del juego (opcional)"
                rows={3}
                disabled={isUpdating}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => window.location.href = '/admin/workspaces'}
                disabled={isUpdating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Workspace Image */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5" />
            <span>Imagen del Juego</span>
          </CardTitle>
          <CardDescription>
            Personaliza la imagen que representa a este juego
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            {/* Image Preview */}
            <WorkspaceAvatar workspace={workspace} size="lg" />

            {/* Upload Button */}
            <div className="flex flex-col space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploadingImage}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploadingImage ? 'Subiendo...' : 'Subir imagen'}
              </Button>
              {workspace.image && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteImage}
                  disabled={isUploadingImage}
                  className="text-destructive"
                >
                  Eliminar imagen
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            JPG, PNG o WebP. Máximo 2MB. Recomendado: 200x200px
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Zona de Peligro</span>
          </CardTitle>
          <CardDescription>
            Acciones irreversibles para este juego
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/5">
            <h4 className="font-medium text-destructive mb-2">
              Eliminar Juego
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Esta acción eliminará permanentemente el juego y todos sus datos. 
              Esta acción no se puede deshacer.
            </p>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDeleteWorkspace}
              disabled={isDeletingWorkspace}
            >
              {isDeletingWorkspace ? 'Eliminando...' : 'Eliminar Juego'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}