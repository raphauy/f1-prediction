'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createGrandPrixAction, updateGrandPrixAction } from './actions'
import { formatInTimeZone } from 'date-fns-tz'
import type { GrandPrixWithDetails } from '@/services/grand-prix-service'

// Lista de zonas horarias más comunes para F1
const F1_TIMEZONES = [
  { value: 'Australia/Melbourne', label: 'Melbourne (Australia)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (China)' },
  { value: 'Asia/Tokyo', label: 'Suzuka (Japón)' },
  { value: 'Asia/Singapore', label: 'Singapur' },
  { value: 'Asia/Dubai', label: 'Abu Dhabi (EAU)' },
  { value: 'Asia/Baku', label: 'Bakú (Azerbaiyán)' },
  { value: 'Europe/Monaco', label: 'Mónaco' },
  { value: 'Europe/Madrid', label: 'Barcelona (España)' },
  { value: 'Europe/London', label: 'Silverstone (Reino Unido)' },
  { value: 'Europe/Rome', label: 'Monza (Italia)' },
  { value: 'Europe/Budapest', label: 'Budapest (Hungría)' },
  { value: 'Europe/Vienna', label: 'Red Bull Ring (Austria)' },
  { value: 'Europe/Brussels', label: 'Spa (Bélgica)' },
  { value: 'Europe/Amsterdam', label: 'Zandvoort (Países Bajos)' },
  { value: 'America/Montreal', label: 'Montreal (Canadá)' },
  { value: 'America/New_York', label: 'Miami (Estados Unidos)' },
  { value: 'America/Chicago', label: 'Austin (Estados Unidos)' },
  { value: 'America/Los_Angeles', label: 'Las Vegas (Estados Unidos)' },
  { value: 'America/Mexico_City', label: 'Ciudad de México' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (Brasil)' },
]

interface GrandPrixFormProps {
  grandPrix?: GrandPrixWithDetails
  seasons: { id: string; name: string; year: number }[]
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isEdit ? 'Actualizar' : 'Crear'} Grand Prix
    </Button>
  )
}

export function GrandPrixForm({ grandPrix, seasons }: GrandPrixFormProps) {
  const [selectedTimezone, setSelectedTimezone] = useState(grandPrix?.timezone || 'Europe/Monaco')
  const [error, setError] = useState<string | null>(null)

  // Si estamos editando, convertir las fechas UTC a la zona horaria local
  const getLocalDateString = (utcDate: Date | string, timezone: string) => {
    const date = new Date(utcDate)
    return formatInTimeZone(date, timezone, 'yyyy-MM-dd')
  }

  const getLocalTimeString = (utcDate: Date | string, timezone: string) => {
    const date = new Date(utcDate)
    return formatInTimeZone(date, timezone, 'HH:mm')
  }

  const action = async (formData: FormData) => {
    formData.set('timezone', selectedTimezone)
    
    const result = grandPrix
      ? await updateGrandPrixAction(grandPrix.id, formData)
      : await createGrandPrixAction(formData)
    
    if (result && !result.success) {
      setError(result.error || 'Error al procesar la solicitud')
    }
  }

  return (
    <form action={action} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="seasonId">Temporada</Label>
          <Select name="seasonId" defaultValue={grandPrix?.seasonId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una temporada" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem key={season.id} value={season.id}>
                  {season.name} ({season.year})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="round">Ronda</Label>
          <Input
            id="round"
            name="round"
            type="number"
            min="1"
            max="30"
            defaultValue={grandPrix?.round}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre del Grand Prix</Label>
        <Input
          id="name"
          name="name"
          placeholder="ej: Australian Grand Prix"
          defaultValue={grandPrix?.name}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="location">Ciudad</Label>
          <Input
            id="location"
            name="location"
            placeholder="ej: Melbourne"
            defaultValue={grandPrix?.location}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">País</Label>
          <Input
            id="country"
            name="country"
            placeholder="ej: Australia"
            defaultValue={grandPrix?.country}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="circuit">Circuito</Label>
          <Input
            id="circuit"
            name="circuit"
            placeholder="ej: Albert Park"
            defaultValue={grandPrix?.circuit}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Zona Horaria</Label>
        <Select 
          value={selectedTimezone} 
          onValueChange={setSelectedTimezone}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona la zona horaria" />
          </SelectTrigger>
          <SelectContent>
            {F1_TIMEZONES.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Las fechas y horas se guardarán en la zona horaria del circuito
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="font-medium">Clasificación</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="qualifyingDate">Fecha</Label>
              <Input
                id="qualifyingDate"
                name="qualifyingDate"
                type="date"
                defaultValue={
                  grandPrix 
                    ? getLocalDateString(grandPrix.qualifyingDate, selectedTimezone)
                    : undefined
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualifyingTime">Hora local</Label>
              <Input
                id="qualifyingTime"
                name="qualifyingTime"
                type="time"
                defaultValue={
                  grandPrix 
                    ? getLocalTimeString(grandPrix.qualifyingDate, selectedTimezone)
                    : undefined
                }
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Carrera</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="raceDate">Fecha</Label>
              <Input
                id="raceDate"
                name="raceDate"
                type="date"
                defaultValue={
                  grandPrix 
                    ? getLocalDateString(grandPrix.raceDate, selectedTimezone)
                    : undefined
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="raceTime">Hora local</Label>
              <Input
                id="raceTime"
                name="raceTime"
                type="time"
                defaultValue={
                  grandPrix 
                    ? getLocalTimeString(grandPrix.raceDate, selectedTimezone)
                    : undefined
                }
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="isSprint" 
          name="isSprint" 
          value="true"
          defaultChecked={grandPrix?.isSprint}
        />
        <Label 
          htmlFor="isSprint" 
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Este es un fin de semana de Sprint
        </Label>
      </div>

      <div className="flex gap-4">
        <SubmitButton isEdit={!!grandPrix} />
        <Button type="button" variant="outline" asChild>
          <a href="/admin/grand-prix">Cancelar</a>
        </Button>
      </div>
    </form>
  )
}