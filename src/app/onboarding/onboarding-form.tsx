"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Loader2, User, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { completeOnboardingAction, uploadProfileImageAction } from "./actions"

interface OnboardingFormProps {
  user: {
    id: string
    email: string
    name?: string | null
    image?: string | null
  }
  workspaceSlug?: string
}

export function OnboardingForm({ user, workspaceSlug }: OnboardingFormProps) {
  const [name, setName] = useState(user.name || "")
  const [image, setImage] = useState(user.image || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imageKey, setImageKey] = useState(0) // Para forzar re-render de imagen
  const router = useRouter()

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
        console.log("Image uploaded successfully:", result.imageUrl)
        setImage(result.imageUrl)
        setImageKey(prev => prev + 1) // Forzar re-render
        toast.success("Imagen subida correctamente")
      } else {
        console.error("Upload failed:", result.error)
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
      const result = await completeOnboardingAction({
        name: name.trim(),
        image: image || null
      })

      if (result.success) {
        toast.success("¡Perfil completado exitosamente!")
        
        // Redirigir al workspace si fue especificado, o al dashboard
        if (workspaceSlug) {
          router.push(`/w/${workspaceSlug}`)
        } else {
          router.push("/admin")
        }
      } else {
        toast.error(result.error || "Error al completar el perfil")
      }
    } catch (error) {
      console.error("Error completing onboarding:", error)
      toast.error("Error al completar el perfil")
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
      {/* Información del usuario */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Conectado como: <span className="font-medium">{user.email}</span>
        </p>
      </div>

      {/* Upload de imagen de perfil */}
      <div className="space-y-3">
        <Label>Foto de perfil (opcional)</Label>
        <div className="flex flex-col items-center space-y-3">
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

          <Card className={`w-full border-dashed border-2 transition-colors ${
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
                      Haz clic para subir una imagen
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

      {/* Campo de nombre */}
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

      {/* Botón de envío */}
      <Button
        type="submit"
        disabled={isLoading || !name.trim()}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Completando perfil...
          </>
        ) : (
          <>
            Completar perfil
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>

      {/* Información adicional */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Podrás editar esta información más tarde en tu perfil
        </p>
      </div>
    </form>
  )
}