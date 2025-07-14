"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createUserAction } from "./actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function UserForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    
    try {
      const result = await createUserAction(formData)
      
      if (result.success) {
        toast.success(result.message)
        router.push("/admin/users")
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Error creando usuario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="usuario@ejemplo.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Nombre del usuario"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Rol</Label>
          <Select name="role" defaultValue="normal">
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Usuario Normal</SelectItem>
              <SelectItem value="superadmin">Superadmin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Creando..." : "Crear Usuario"}
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.push("/admin/users")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}