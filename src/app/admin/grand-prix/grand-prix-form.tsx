'use client'

import { useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { DateTimeInput } from '@/components/ui/datetime-input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, AlertCircle, Info, ExternalLink } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createGrandPrixAction, updateGrandPrixAction } from './actions'
import { differenceInDays } from 'date-fns'
import { useUserTimezone } from '@/hooks/use-user-timezone'
import { utcToLocalDateTimeString, getTimezoneDisplay } from '@/lib/date-formatting'
import type { GrandPrixWithDetails } from '@/services/grand-prix-service'
import Link from 'next/link'

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
  const { timezone: userTimezone, isClient } = useUserTimezone()
  const [selectedTimezone, setSelectedTimezone] = useState(grandPrix?.timezone || 'Europe/Monaco')
  const [error, setError] = useState<string | null>(null)
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const [qualifyingDateTime, setQualifyingDateTime] = useState('')
  const [raceDateTime, setRaceDateTime] = useState('')
  const [isSprint, setIsSprint] = useState(grandPrix?.isSprint || false)

  // Inicializar valores para edición - convertir UTC a hora local del admin
  useEffect(() => {
    if (grandPrix) {
      // Inicializar con los valores del GP existente
      const qualifyingLocal = utcToLocalDateTimeString(grandPrix.qualifyingDate)
      const raceLocal = utcToLocalDateTimeString(grandPrix.raceDate)
      
      if (qualifyingLocal) setQualifyingDateTime(qualifyingLocal)
      if (raceLocal) setRaceDateTime(raceLocal)
    }
  }, [grandPrix])

  // Validación en tiempo real
  useEffect(() => {
    const warnings: string[] = []
    
    // Solo mostrar advertencias si no está deshabilitada la validación
    if (process.env.NEXT_PUBLIC_DISABLE_GP_DATE_VALIDATION !== 'true') {
      if (qualifyingDateTime && raceDateTime) {
        // Los datetime-local inputs devuelven strings sin zona, interpretados como hora local
        const qDate = new Date(qualifyingDateTime)
        const rDate = new Date(raceDateTime)
        
        // Validar orden de fechas
        if (qDate >= rDate) {
          warnings.push('La clasificación debe ser antes que la carrera')
        } else {
          // Validar diferencia de días
          const daysDiff = differenceInDays(rDate, qDate)
          
          if (isSprint) {
            if (daysDiff < 2 || daysDiff > 3) {
              warnings.push('Para Sprint: debe haber 2-3 días entre clasificación y carrera')
            }
          } else {
            if (daysDiff < 1 || daysDiff > 2) {
              warnings.push('Para carrera normal: debe haber 1-2 días entre clasificación y carrera')
            }
          }
        }
        
        // Validar fechas futuras (solo para creación)
        if (!grandPrix) {
          const now = new Date()
          if (qDate <= now) {
            warnings.push('La fecha de clasificación debe ser futura')
          }
        }
      }
      
    }
    
    setValidationWarnings(warnings)
  }, [qualifyingDateTime, raceDateTime, isSprint, grandPrix])

  const action = async (formData: FormData) => {
    formData.set('timezone', selectedTimezone)
    
    // Agregar la zona horaria del navegador del usuario para conversión correcta
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    formData.set('userTimezone', userTimezone)
    
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

      {validationWarnings.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 px-4 py-3 rounded space-y-2">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Advertencias de validación:</span>
          </div>
          <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
            {validationWarnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
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
        <Label htmlFor="timezone">Zona Horaria del Circuito</Label>
        <Select 
          value={selectedTimezone} 
          onValueChange={setSelectedTimezone}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona la zona horaria del circuito" />
          </SelectTrigger>
          <SelectContent>
            {F1_TIMEZONES.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="text-blue-700 dark:text-blue-300">
              Estás ingresando fechas y horas en tu zona horaria local: <strong>{isClient ? getTimezoneDisplay(userTimezone) : 'Cargando...'}</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="qualifyingDateTime">Fecha y Hora de Clasificación (tu hora local)</Label>
          <DateTimeInput
            id="qualifyingDateTime"
            name="qualifyingDateTime"
            value={qualifyingDateTime}
            onChange={setQualifyingDateTime}
            required
            placeholder="06/09/2025, 11:00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="raceDateTime">Fecha y Hora de Carrera (tu hora local)</Label>
          <DateTimeInput
            id="raceDateTime"
            name="raceDateTime"
            value={raceDateTime}
            onChange={setRaceDateTime}
            required
            placeholder="07/09/2025, 10:00"
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 text-sm"
          asChild
        >
          <Link 
            href={`https://www.formula1.com/en/racing/${new Date().getFullYear()}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
            Consultar calendario oficial de F1
          </Link>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="isSprint" 
          name="isSprint" 
          value="true"
          checked={isSprint}
          onCheckedChange={(checked) => setIsSprint(checked as boolean)}
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
          <Link href="/admin/grand-prix">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}