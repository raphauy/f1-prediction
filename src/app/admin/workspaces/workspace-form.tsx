"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createWorkspaceAction, updateWorkspaceAction } from "./actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type Workspace = {
  id: string
  name: string
  slug: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

interface WorkspaceFormProps {
  workspace?: Workspace
  isEdit?: boolean
}

export function WorkspaceForm({ workspace, isEdit = false }: WorkspaceFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Función para generar slug automáticamente
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
      .replace(/^-|-$/g, '') // Remover guiones al inicio y final
  }

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    
    try {
      const result = isEdit 
        ? await updateWorkspaceAction(workspace!.id, formData)
        : await createWorkspaceAction(formData)
      
      if (result.success) {
        toast.success(result.message)
        router.push("/admin/workspaces")
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error procesando workspace")
    } finally {
      setLoading(false)
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameInput = e.target
    const slugInput = document.getElementById('slug') as HTMLInputElement
    
    // Solo auto-generar slug si no estamos editando o si el slug está vacío
    if (!isEdit || !slugInput.value) {
      slugInput.value = generateSlug(nameInput.value)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Mi Workspace"
            defaultValue={workspace?.name || ""}
            onChange={handleNameChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            name="slug"
            type="text"
            placeholder="mi-workspace"
            defaultValue={workspace?.slug || ""}
            pattern="^[a-z0-9-]+$"
            title="Solo letras minúsculas, números y guiones"
            required
          />
          <p className="text-xs text-muted-foreground">
            Solo letras minúsculas, números y guiones. Se usa en URLs.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Descripción del workspace (opcional)"
          defaultValue={workspace?.description || ""}
          rows={3}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading 
            ? (isEdit ? "Actualizando..." : "Creando...") 
            : (isEdit ? "Actualizar Workspace" : "Crear Workspace")
          }
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.push("/admin/workspaces")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}