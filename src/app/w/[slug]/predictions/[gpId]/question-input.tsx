"use client"

import { DriverSelector } from './driver-selector'
import { TeamSelector } from './team-selector'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useMediaQuery } from '@/hooks/use-media-query'

interface QuestionInputProps {
  type: string
  options?: Record<string, unknown>
  value: string
  onChange: (value: string) => void
  error?: string | null
}

export function QuestionInput({ type, options, value, onChange, error }: QuestionInputProps) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  
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
            <ScrollArea className={isMobile ? "h-[calc(100dvh-320px)]" : "h-auto max-h-[400px]"}>
              <div className="space-y-3 pr-4">
                {choices.map((choice: string) => (
                  <div key={choice} className="flex items-center space-x-3 p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={choice} id={choice} className="min-w-[20px] h-5 w-5 sm:h-4 sm:w-4" />
                    <Label htmlFor={choice} className="cursor-pointer flex-1 text-sm sm:text-base py-1">
                      {choice}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
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
            className="max-w-xs text-base"
            inputMode="numeric"
            pattern="[0-9]*"
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
          <RadioGroup value={value} onValueChange={onChange}>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="Sí" id="si" className="min-w-[20px] h-5 w-5 sm:h-4 sm:w-4" />
                <Label htmlFor="si" className="cursor-pointer text-base font-medium">
                  Sí
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="No" id="no" className="min-w-[20px] h-5 w-5 sm:h-4 sm:w-4" />
                <Label htmlFor="no" className="cursor-pointer text-base font-medium">
                  No
                </Label>
              </div>
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

    case 'HEAD_TO_HEAD':
      const headOptions = (options?.values as string[]) || []
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {headOptions.map((option: string) => (
              <Button
                key={option}
                type="button"
                variant={value === option ? 'default' : 'outline'}
                onClick={() => onChange(option)}
                className="h-16 sm:h-20 text-base sm:text-lg font-medium"
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