'use client'

import { useState, useEffect } from 'react'
import { useFormStatus } from 'react-dom'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, AlertCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createGrandPrixAction, updateGrandPrixAction } from './actions'
import { formatInTimeZone } from 'date-fns-tz'
import { differenceInDays, parseISO } from 'date-fns'
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
  const [selectedTimezone, setSelectedTimezone] = useState(grandPrix?.timezone || 'Europe/Monaco')
  const [error, setError] = useState<string | null>(null)
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const [qualifyingDate, setQualifyingDate] = useState('')
  const [qualifyingTime, setQualifyingTime] = useState('')
  const [raceDate, setRaceDate] = useState('')
  const [raceTime, setRaceTime] = useState('')
  const [isSprint, setIsSprint] = useState(grandPrix?.isSprint || false)

  // Si estamos editando, convertir las fechas UTC a la zona horaria local
  const getLocalDateString = (utcDate: Date | string, timezone: string) => {
    const date = new Date(utcDate)
    return formatInTimeZone(date, timezone, 'yyyy-MM-dd')
  }

  const getLocalTimeString = (utcDate: Date | string, timezone: string) => {
    const date = new Date(utcDate)
    return formatInTimeZone(date, timezone, 'HH:mm')
  }

  // Inicializar valores para edición
  useEffect(() => {
    if (grandPrix) {
      setQualifyingDate(getLocalDateString(grandPrix.qualifyingDate, selectedTimezone))
      setQualifyingTime(getLocalTimeString(grandPrix.qualifyingDate, selectedTimezone))
      setRaceDate(getLocalDateString(grandPrix.raceDate, selectedTimezone))
      setRaceTime(getLocalTimeString(grandPrix.raceDate, selectedTimezone))
    }
  }, [grandPrix, selectedTimezone])

  // Validación en tiempo real
  useEffect(() => {
    const warnings: string[] = []
    
    if (qualifyingDate && raceDate) {
      const qDate = parseISO(qualifyingDate)
      const rDate = parseISO(raceDate)
      
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
    
    // Validar horarios típicos
    if (qualifyingTime) {
      const hour = parseInt(qualifyingTime.split(':')[0])
      if (hour < 13 || hour > 18) {
        warnings.push('Horario de clasificación atípico (normalmente 13:00-18:00)')
      }
    }
    
    if (raceTime) {
      const hour = parseInt(raceTime.split(':')[0])
      const isLasVegas = selectedTimezone === 'America/Los_Angeles'
      
      if (isLasVegas) {
        if (hour >= 6 && hour <= 19) {
          warnings.push('Las Vegas tiene carreras nocturnas (20:00-02:00)')
        }
      } else {
        if (hour < 12 || hour > 16) {
          warnings.push('Horario de carrera atípico (normalmente 12:00-16:00)')
        }
      }
    }
    
    setValidationWarnings(warnings)
  }, [qualifyingDate, qualifyingTime, raceDate, raceTime, isSprint, grandPrix, selectedTimezone])

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
                value={qualifyingDate}
                onChange={(e) => setQualifyingDate(e.target.value)}
                min={!grandPrix ? new Date().toISOString().split('T')[0] : undefined}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qualifyingTime">Hora local</Label>
              <Input
                id="qualifyingTime"
                name="qualifyingTime"
                type="time"
                value={qualifyingTime}
                onChange={(e) => setQualifyingTime(e.target.value)}
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
                value={raceDate}
                onChange={(e) => setRaceDate(e.target.value)}
                min={!grandPrix ? new Date().toISOString().split('T')[0] : undefined}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="raceTime">Hora local</Label>
              <Input
                id="raceTime"
                name="raceTime"
                type="time"
                value={raceTime}
                onChange={(e) => setRaceTime(e.target.value)}
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