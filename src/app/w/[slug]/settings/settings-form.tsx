'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Settings, AlertTriangle, Upload, Image as ImageIcon } from "lucide-react"
import { toast } from 'sonner'
import { 
  updateWorkspaceAction, 
  uploadWorkspaceImageAction, 
  deleteWorkspaceImageAction,
  deleteWorkspaceAction 
} from './actions'

interface SettingsFormProps {
  workspace: {
    id: string
    slug: string
    name: string
    description: string | null
    image: string | null
  }
}

export function SettingsForm({ workspace }: SettingsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false)

  const handleUpdateWorkspace = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsUpdating(true)

    const formData = new FormData(event.currentTarget)

    try {
      await updateWorkspaceAction(workspace.slug, formData)
      toast.success('Workspace actualizado correctamente')
    } catch {
      toast.error('Error al actualizar el workspace')
    } finally {
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
      await uploadWorkspaceImageAction(workspace.slug, formData)
      toast.success('Imagen actualizada correctamente')
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
      await deleteWorkspaceImageAction(workspace.slug)
      toast.success('Imagen eliminada correctamente')
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
      await deleteWorkspaceAction(workspace.slug)
      toast.success('Workspace eliminado correctamente')
    } catch {
      toast.error('Error al eliminar el juego')
      setIsDeletingWorkspace(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
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
            Información básica del workspace
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
                  placeholder="Nombre del workspace"
                  required
                  disabled={isUpdating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input 
                  id="slug" 
                  defaultValue={workspace.slug}
                  placeholder="workspace-slug"
                  readOnly
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  El slug no se puede cambiar después de la creación
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea 
                id="description"
                name="description"
                defaultValue={workspace.description || ""}
                placeholder="Descripción del workspace (opcional)"
                rows={3}
                disabled={isUpdating}
              />
            </div>

            <div className="flex justify-end">
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
            <span>Imagen del Workspace</span>
          </CardTitle>
          <CardDescription>
            Personaliza la imagen que representa a este workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            {/* Image Preview */}
            <div className="relative">
              {workspace.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={workspace.image}
                  alt={workspace.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-semibold text-primary">
                    {getInitials(workspace.name)}
                  </span>
                </div>
              )}
            </div>

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
            Acciones irreversibles para este workspace
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