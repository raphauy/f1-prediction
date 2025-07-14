'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { createSeasonAction, updateSeasonAction } from './actions'

interface SeasonFormProps {
  season?: {
    id: string
    year: number
    name: string
    startDate: Date
    endDate: Date
    isActive: boolean
  }
}

export function SeasonForm({ season }: SeasonFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!season

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)

    try {
      if (isEditing) {
        await updateSeasonAction(season.id, formData)
        toast.success('Temporada actualizada correctamente')
      } else {
        await createSeasonAction(formData)
        toast.success('Temporada creada correctamente')
      }
    } catch {
      toast.error(
        isEditing
          ? 'Error al actualizar la temporada'
          : 'Error al crear la temporada'
      )
      setIsSubmitting(false)
    }
  }

  // Formatear fechas para el input
  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="year">Año</Label>
          <Input
            id="year"
            name="year"
            type="number"
            min="2025"
            max="2050"
            defaultValue={season?.year || new Date().getFullYear() + 1}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Nombre de la temporada</Label>
          <Input
            id="name"
            name="name"
            placeholder="F1 2025 Season"
            defaultValue={season?.name}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="startDate">Fecha de inicio</Label>
            <div className="relative">
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={formatDateForInput(season?.startDate)}
                required
                disabled={isSubmitting}
              />
              <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="endDate">Fecha de fin</Label>
            <div className="relative">
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={formatDateForInput(season?.endDate)}
                required
                disabled={isSubmitting}
              />
              <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            name="isActive"
            defaultChecked={season?.isActive || false}
            disabled={isSubmitting}
          />
          <Label htmlFor="isActive">
            Temporada activa
            <span className="block text-sm font-normal text-muted-foreground">
              Solo puede haber una temporada activa a la vez
            </span>
          </Label>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? isEditing
              ? 'Actualizando...'
              : 'Creando...'
            : isEditing
            ? 'Actualizar temporada'
            : 'Crear temporada'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/seasons')}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}