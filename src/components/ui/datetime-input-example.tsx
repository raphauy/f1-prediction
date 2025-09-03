"use client"

import { useState } from 'react'
import { DateTimeInput } from './datetime-input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Button } from './button'

/**
 * Ejemplo de uso del componente DateTimeInput
 * Este archivo es solo para demostración y puede ser eliminado
 */
export function DateTimeInputExample() {
  const [datetime, setDatetime] = useState('')
  const [formData, setFormData] = useState<{ name: string; datetime: string }>({ name: '', datetime: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Datos del formulario:', formData)
    alert(`Enviado:\nNombre: ${formData.name}\nFecha y hora: ${formData.datetime}`)
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Ejemplo de DateTimeInput</CardTitle>
          <CardDescription>
            Componente de selección de fecha y hora optimizado para usuarios latinoamericanos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ejemplo simple */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Uso básico</h3>
            <DateTimeInput
              value={datetime}
              onChange={setDatetime}
              placeholder="Seleccionar fecha y hora del GP"
            />
            <p className="text-sm text-muted-foreground">
              Valor actual: <code className="bg-muted px-2 py-1 rounded">{datetime || '(vacío)'}</code>
            </p>
          </div>

          {/* Ejemplo en formulario */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">En un formulario</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="gp-name" className="text-sm font-medium">
                  Nombre del Gran Premio *
                </label>
                <input
                  id="gp-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ej: Gran Premio de Argentina 2025"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="gp-datetime" className="text-sm font-medium">
                  Fecha y hora del evento *
                </label>
                <DateTimeInput
                  id="gp-datetime"
                  name="datetime"
                  value={formData.datetime}
                  onChange={(value) => setFormData(prev => ({ ...prev, datetime: value }))}
                  required
                  placeholder="Fecha y hora del Gran Premio"
                />
              </div>

              <Button type="submit" disabled={!formData.name || !formData.datetime}>
                Crear Gran Premio
              </Button>
            </form>
          </div>

          {/* Información adicional */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h4 className="font-medium">Características del componente:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✅ Formato latinoamericano: dd/MM/yyyy, HH:mm</li>
              <li>✅ Calendar picker visual para fechas</li>
              <li>✅ Time picker con inputs de hora y minuto</li>
              <li>✅ Botones rápidos para horas comunes</li>
              <li>✅ Validación de formato y rangos</li>
              <li>✅ Accesible y responsive</li>
              <li>✅ Fallback para navegadores antiguos</li>
              <li>✅ Valor interno compatible con backend (yyyy-MM-dd&apos;T&apos;HH:mm)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}