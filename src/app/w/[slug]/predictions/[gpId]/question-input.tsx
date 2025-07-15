"use client"

import { DriverSelector } from './driver-selector'
import { TeamSelector } from './team-selector'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

interface QuestionInputProps {
  type: string
  options?: Record<string, unknown>
  value: string
  onChange: (value: string) => void
  error?: string | null
}

export function QuestionInput({ type, options, value, onChange, error }: QuestionInputProps) {
  switch (type) {
    case 'DRIVERS':
      return (
        <div className="space-y-4">
          <DriverSelector value={value} onChange={onChange} />
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )

    case 'TEAMS':
      return (
        <div className="space-y-4">
          <TeamSelector value={value} onChange={onChange} />
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )

    case 'MULTIPLE_CHOICE':
      const choices = (options?.values as string[]) || []
      return (
        <div className="space-y-4">
          <RadioGroup value={value} onValueChange={onChange}>
            <div className="space-y-2">
              {choices.map((choice: string) => (
                <div key={choice} className="flex items-center space-x-2">
                  <RadioGroupItem value={choice} id={choice} />
                  <Label htmlFor={choice} className="cursor-pointer flex-1">
                    {choice}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )

    case 'NUMERIC':
      return (
        <div className="space-y-4">
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ingresa un número"
            className="max-w-xs"
          />
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )

    case 'BOOLEAN':
      return (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Switch
              checked={value === 'Sí'}
              onCheckedChange={(checked) => onChange(checked ? 'Sí' : 'No')}
              id="boolean-switch"
            />
            <Label htmlFor="boolean-switch" className="text-lg">
              {value === 'Sí' ? 'Sí' : 'No'}
            </Label>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )

    case 'HEAD_TO_HEAD':
      const headOptions = (options?.values as string[]) || []
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {headOptions.map((option: string) => (
              <Button
                key={option}
                type="button"
                variant={value === option ? 'default' : 'outline'}
                onClick={() => onChange(option)}
                className="h-20 text-lg"
              >
                {option}
              </Button>
            ))}
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )

    default:
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tipo de pregunta no soportado: {type}
          </AlertDescription>
        </Alert>
      )
  }
}

// Necesitamos importar Button
import { Button } from '@/components/ui/button'