'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QuestionType, QuestionCategory } from '@prisma/client'
import { createQuestionAction, updateQuestionAction } from './actions'
import { toast } from 'sonner'

interface QuestionFormProps {
  question?: {
    id: string
    text: string
    type: QuestionType
    category: QuestionCategory
    defaultPoints: number
  }
}

const questionTypeLabels: Record<QuestionType, string> = {
  WINNER: 'Ganador de la carrera',
  POLE_POSITION: 'Pole Position',
  FASTEST_LAP: 'Vuelta más rápida',
  PODIUM: 'Podio (Top 3)',
  TEAM_WINNER: 'Equipo ganador',
  DNF: 'Did Not Finish',
  POINTS_FINISH: 'Terminar en puntos',
  MULTIPLE_CHOICE: 'Opción múltiple',
  NUMERIC: 'Respuesta numérica',
  BOOLEAN: 'Sí/No',
  HEAD_TO_HEAD: 'Head to Head',
}

const categoryLabels: Record<QuestionCategory, string> = {
  CLASSIC: 'Preguntas Clásicas',
  PILOT_FOCUS: 'Piloto en el Foco',
  STROLLOMETER: 'Strollómetro',
}

export function QuestionForm({ question }: QuestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!question

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      const result = isEditing
        ? await updateQuestionAction(question.id, formData)
        : await createQuestionAction(formData)

      if (result?.error) {
        toast.error(result.error)
        setIsSubmitting(false)
      }
    } catch {
      toast.error('Error al procesar la solicitud')
      setIsSubmitting(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="text">Texto de la pregunta</Label>
        <Input
          id="text"
          name="text"
          placeholder="Ej: ¿Quién ganará la carrera?"
          defaultValue={question?.text}
          required
          maxLength={200}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="category">Categoría</Label>
        <Select name="category" defaultValue={question?.category || QuestionCategory.CLASSIC} required>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Selecciona la categoría" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="type">Tipo de pregunta</Label>
        <Select name="type" defaultValue={question?.type || QuestionType.WINNER} required>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Selecciona el tipo de pregunta" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(questionTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="defaultPoints">Puntos por defecto</Label>
        <Input
          id="defaultPoints"
          name="defaultPoints"
          type="number"
          min="1"
          max="100"
          defaultValue={question?.defaultPoints || 10}
          required
          className="mt-1"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Los puntos pueden ser personalizados para cada Grand Prix
        </p>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'} Pregunta
        </Button>
      </div>
    </form>
  )
}