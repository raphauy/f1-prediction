'use client'

import { useState, useEffect } from 'react'
import { Input } from './input'
import { Button } from './button'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { format, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateTimeInputProps {
  id?: string
  name?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
  className?: string
  placeholder?: string
}

/**
 * Componente avanzado de selección de fecha y hora para usuarios latinoamericanos
 * - Muestra formato dd/MM/yyyy, HH:mm (24 horas)
 * - Calendar picker visual para fechas
 * - Time picker con selectores de hora y minuto
 * - Maneja formato interno yyyy-MM-dd'T'HH:mm para compatibilidad backend
 */
export function DateTimeInput({
  id,
  name,
  value,
  onChange,
  required,
  disabled,
  className,
  placeholder = 'Seleccionar fecha y hora'
}: DateTimeInputProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [hours, setHours] = useState('12')
  const [minutes, setMinutes] = useState('00')

  // Inicializar valores desde el prop value
  useEffect(() => {
    if (value) {
      try {
        const date = new Date(value)
        if (isValid(date)) {
          setSelectedDate(date)
          setHours(format(date, 'HH'))
          setMinutes(format(date, 'mm'))
        }
      } catch {
        // Valor inválido, usar valores por defecto
        setSelectedDate(undefined)
        setHours('12')
        setMinutes('00')
      }
    } else {
      setSelectedDate(undefined)
      setHours('12')
      setMinutes('00')
    }
  }, [value])

  // Construir el valor final cuando cambian fecha, hora o minutos
  const updateDateTime = (date?: Date, newHours?: string, newMinutes?: string) => {
    const currentDate = date || selectedDate
    const currentHours = newHours || hours
    const currentMinutes = newMinutes || minutes

    if (currentDate && isValid(currentDate)) {
      // Crear nueva fecha con la hora seleccionada
      const dateTime = new Date(currentDate)
      dateTime.setHours(parseInt(currentHours, 10))
      dateTime.setMinutes(parseInt(currentMinutes, 10))
      dateTime.setSeconds(0)
      dateTime.setMilliseconds(0)

      // Formatear como datetime-local string (yyyy-MM-dd'T'HH:mm)
      // Este formato es el que espera el servidor para interpretarlo como hora local
      const formattedValue = format(dateTime, "yyyy-MM-dd'T'HH:mm")
      onChange(formattedValue)
    } else if (!currentDate) {
      // Si no hay fecha seleccionada, limpiar el valor
      onChange('')
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    updateDateTime(date)
  }

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHours = e.target.value
    // Validar que esté entre 00-23
    if (/^([0-1]?[0-9]|2[0-3])$/.test(newHours) || newHours === '') {
      setHours(newHours)
      if (newHours.length === 2) {
        updateDateTime(selectedDate, newHours)
      }
    }
  }

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = e.target.value
    // Validar que esté entre 00-59
    if (/^([0-5]?[0-9])$/.test(newMinutes) || newMinutes === '') {
      setMinutes(newMinutes)
      if (newMinutes.length === 2) {
        updateDateTime(selectedDate, hours, newMinutes)
      }
    }
  }

  // Formatear la fecha para mostrar
  const displayValue = selectedDate && isValid(selectedDate)
    ? `${format(selectedDate, 'dd/MM/yyyy')}, ${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
    : ''

  // Fallback al input nativo para navegadores muy antiguos
  const useFallback = typeof window !== 'undefined' && !CSS.supports('selector(:has(*))')

  if (useFallback) {
    return (
      <Input
        type="datetime-local"
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={className}
      />
    )
  }

  return (
    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            type="text"
            id={id}
            value={displayValue}
            placeholder={placeholder}
            readOnly
            required={required}
            disabled={disabled}
            className={cn('pr-10 cursor-pointer', className)}
            onClick={() => !disabled && setIsCalendarOpen(true)}
          />
          <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          
          {/* Input oculto para el formulario */}
          <input
            type="hidden"
            name={name}
            value={value}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            {/* Calendar */}
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              locale={es}
              initialFocus
              className="rounded-md border"
            />
            
            {/* Time Picker */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Hora</span>
              </div>
              <div className="flex items-center gap-1 justify-center">
                <Input
                  type="text"
                  value={hours}
                  onChange={handleHoursChange}
                  onBlur={(e) => {
                    const value = e.target.value.padStart(2, '0')
                    const numValue = parseInt(value, 10)
                    if (numValue >= 0 && numValue <= 23) {
                      setHours(value)
                      updateDateTime(selectedDate, value)
                    }
                  }}
                  className="w-16 text-center"
                  placeholder="HH"
                  maxLength={2}
                />
                <span className="text-lg font-medium text-muted-foreground">:</span>
                <Input
                  type="text"
                  value={minutes}
                  onChange={handleMinutesChange}
                  onBlur={(e) => {
                    const value = e.target.value.padStart(2, '0')
                    const numValue = parseInt(value, 10)
                    if (numValue >= 0 && numValue <= 59) {
                      setMinutes(value)
                      updateDateTime(selectedDate, hours, value)
                    }
                  }}
                  className="w-16 text-center"
                  placeholder="MM"
                  maxLength={2}
                />
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Formato 24 horas (00:00 - 23:59)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDate(undefined)
                  setHours('12')
                  setMinutes('00')
                  onChange('')
                }}
                className="flex-1"
              >
                Limpiar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setIsCalendarOpen(false)}
                className="flex-1"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </PopoverContent>
    </Popover>
  )
}