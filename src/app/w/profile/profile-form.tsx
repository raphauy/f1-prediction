"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Loader2, User, Save } from "lucide-react"
import { toast } from "sonner"
import { updateProfileAction, uploadProfileImageAction } from "./actions"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface ProfileFormProps {
  user: {
    id: string
    email: string
    name?: string | null
    image?: string | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name || "")
  const [image, setImage] = useState(user.image || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageKey, setImageKey] = useState(0) // Para forzar re-render de imagen
  const router = useRouter()
  const { update: updateSession } = useSession()

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 5MB")
      return
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast.error("Debes seleccionar una imagen")
      return
    }

    setIsUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadProfileImageAction(formData)

      if (result.success && result.imageUrl) {
        setImage(result.imageUrl)
        setImageKey(prev => prev + 1) // Forzar re-render
        toast.success("Imagen subida correctamente")
      } else {
        toast.error(result.error || "Error al subir la imagen")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Error al subir la imagen")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("El nombre es requerido")
      return
    }

    setIsLoading(true)

    try {
      const result = await updateProfileAction({
        name: name.trim(),
        image: image || null
      })

      if (result.success) {
        toast.success("Perfil actualizado exitosamente")
        
        // Actualizar la sesión de NextAuth inmediatamente
        await updateSession({
          name: name.trim(),
          image: image || null
        })
        
        // Pequeño delay para asegurar que la sesión se actualice
        setTimeout(() => {
          router.refresh() // Refrescar para mostrar cambios en header
        }, 100)
      } else {
        toast.error(result.error || "Error al actualizar el perfil")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Error al actualizar el perfil")
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información personal */}
      <Card>
        <CardHeader>
          <CardTitle>Información personal</CardTitle>
          <CardDescription>
            Actualiza tu información básica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email (solo lectura) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500">
              El email no se puede cambiar
            </p>
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre completo *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ingresa tu nombre completo"
              disabled={isLoading}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Imagen de perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Foto de perfil</CardTitle>
          <CardDescription>
            Esta imagen se mostrará en tu perfil y en toda la aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24" key={imageKey}>
                {image ? (
                  <AvatarImage 
                    src={image} 
                    alt="Foto de perfil" 
                    className="object-cover" 
                  />
                ) : (
                  <AvatarFallback className="text-lg bg-gray-100">
                    {name ? getInitials(name) : <User className="w-8 h-8" />}
                  </AvatarFallback>
                )}
              </Avatar>
              
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="w-full max-w-sm">
              <Card className={`border-dashed border-2 transition-colors ${
                isUploadingImage 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <CardContent className="p-4">
                  <label className={`flex flex-col items-center space-y-2 ${
                    isUploadingImage ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}>
                    {isUploadingImage ? (
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-600 text-center">
                      {isUploadingImage ? (
                        "Subiendo imagen..."
                      ) : (
                        <>
                          Haz clic para cambiar imagen
                          <br />
                          <span className="text-xs text-gray-500">JPG, PNG hasta 5MB</span>
                        </>
                      )}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                  </label>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón de guardar */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading || !name.trim()}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </form>
  )
}