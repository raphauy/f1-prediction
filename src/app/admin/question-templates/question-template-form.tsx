'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
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
import { createQuestionTemplateAction, updateQuestionTemplateAction } from './actions'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X, Loader2, Flag, Users, HelpCircle, Hash, Binary, GitCompare } from 'lucide-react'
import { QUESTION_BADGES, getBadgesForType } from '@/lib/constants/question-badges'
import { Badge } from '@/components/ui/badge'

interface QuestionTemplateFormProps {
  template?: {
    id: string
    text: string
    type: QuestionType
    category: QuestionCategory
    defaultPoints: number
    badge?: string | null
    defaultOptions?: unknown
    description?: string | null
  }
}

const questionTypeLabels: Record<QuestionType, string> = {
  DRIVERS: 'Selección de pilotos',
  TEAMS: 'Selección de equipos',
  MULTIPLE_CHOICE: 'Opción múltiple',
  NUMERIC: 'Respuesta numérica',
  BOOLEAN: 'Sí/No',
  HEAD_TO_HEAD: 'Head to Head',
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'} Plantilla
    </Button>
  )
}


const categoryColors = {
  CLASSIC: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  STROLLOMETER: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
}

const categoryLabels = {
  CLASSIC: 'Clásica',
  STROLLOMETER: 'Strollómetro'
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge 
      variant="outline" 
      className={categoryColors[category as keyof typeof categoryColors]}
    >
      {categoryLabels[category as keyof typeof categoryLabels] || category}
    </Badge>
  )
}

const questionTypeColors = {
  DRIVERS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  TEAMS: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  MULTIPLE_CHOICE: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  NUMERIC: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  BOOLEAN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  HEAD_TO_HEAD: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
}

const questionTypeIcons: Record<QuestionType, React.ReactNode> = {
  DRIVERS: <Users className="h-4 w-4" />,
  TEAMS: <Flag className="h-4 w-4" />,
  MULTIPLE_CHOICE: <HelpCircle className="h-4 w-4" />,
  NUMERIC: <Hash className="h-4 w-4" />,
  BOOLEAN: <Binary className="h-4 w-4" />,
  HEAD_TO_HEAD: <GitCompare className="h-4 w-4" />,
}

const questionTypeLabelsShort = {
  DRIVERS: 'Pilotos',
  TEAMS: 'Equipos',
  MULTIPLE_CHOICE: 'Opción Múltiple',
  NUMERIC: 'Numérico',
  BOOLEAN: 'Sí/No',
  HEAD_TO_HEAD: 'H2H',
}

function TypeBadge({ type }: { type: string }) {
  return (
    <Badge 
      variant="outline" 
      className={`flex items-center gap-1 w-fit ${questionTypeColors[type as keyof typeof questionTypeColors]}`}
    >
      {questionTypeIcons[type as QuestionType]}
      <span>{questionTypeLabelsShort[type as keyof typeof questionTypeLabelsShort] || type}</span>
    </Badge>
  )
}


export function QuestionTemplateForm({ template }: QuestionTemplateFormProps) {
  const [selectedType, setSelectedType] = useState<QuestionType>(
    template?.type || QuestionType.DRIVERS
  )
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory>(
    template?.category || QuestionCategory.CLASSIC
  )
  const [selectedBadge, setSelectedBadge] = useState<string>(() => {
    if (template?.badge && typeof template.badge === 'string') {
      return template.badge
    }
    return 'none'
  })
  const [options, setOptions] = useState<string[]>(() => {
    if (template?.defaultOptions && typeof template.defaultOptions === 'object') {
      const opts = template.defaultOptions as { values?: string[]; type?: string }
      if (opts.values && Array.isArray(opts.values)) {
        return opts.values
      }
    }
    return ['', '']
  })
  const [error, setError] = useState<string | null>(null)
  const isEditing = !!template

  const addOption = () => {
    setOptions([...options, ''])
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...options]
    updatedOptions[index] = value
    setOptions(updatedOptions)
  }

  const needsOptions = (type: QuestionType) => {
    return ['MULTIPLE_CHOICE', 'HEAD_TO_HEAD', 'NUMERIC'].includes(type)
  }

  const action = async (formData: FormData) => {
    // Si el tipo de pregunta necesita opciones, las agregamos al formData
    if (needsOptions(selectedType)) {
      const validOptions = options.filter(opt => opt.trim() !== '')
      if (validOptions.length < 2) {
        setError('Debes agregar al menos 2 opciones')
        return
      }
      formData.append('defaultOptions', JSON.stringify({ 
        type: 'custom', 
        values: validOptions 
      }))
    }

    // El badge ya viene en el formData desde el input hidden
    // No necesitamos procesarlo adicionalmente

    const result = isEditing
      ? await updateQuestionTemplateAction(template.id, formData)
      : await createQuestionTemplateAction(formData)

    if (result && result.error) {
      setError(result.error)
    }
  }

  return (
    <form action={action} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div>
        <Label htmlFor="text">Texto de la plantilla</Label>
        <Input
          id="text"
          name="text"
          placeholder="Ej: ¿Quién ganará la carrera?"
          defaultValue={template?.text}
          required
          maxLength={500}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe el uso de esta plantilla..."
          defaultValue={template?.description || ''}
          maxLength={500}
          className="mt-1"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="category">Categoría</Label>
        <input type="hidden" name="category" value={selectedCategory} />
        <Select 
          value={selectedCategory} 
          onValueChange={(value) => setSelectedCategory(value as QuestionCategory)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Selecciona la categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CLASSIC">
              <CategoryBadge category="CLASSIC" />
            </SelectItem>
            <SelectItem value="STROLLOMETER">
              <CategoryBadge category="STROLLOMETER" />
            </SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground mt-1">
          Solo se pueden crear plantillas para categorías Clásica y Strollómetro
        </p>
      </div>

      <div>
        <Label htmlFor="type">Tipo de pregunta</Label>
        <input type="hidden" name="type" value={selectedType} />
        <Select 
          value={selectedType}
          onValueChange={(value) => {
            setSelectedType(value as QuestionType)
            // Reset badge si no está disponible para el nuevo tipo
            const badges = getBadgesForType(value)
            if (!badges.includes(selectedBadge as keyof typeof QUESTION_BADGES)) {
              setSelectedBadge('none')
            }
          }}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Selecciona el tipo de pregunta" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(questionTypeLabels).map(([value]) => (
              <SelectItem key={value} value={value}>
                <TypeBadge type={value} />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {getBadgesForType(selectedType).length > 0 && (
        <div>
          <Label htmlFor="badge">Badge (opcional)</Label>
          <input type="hidden" name="badge" value={selectedBadge} />
          <Select 
            value={selectedBadge}
            onValueChange={setSelectedBadge}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Sin badge" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin badge</SelectItem>
              {getBadgesForType(selectedType).map((badge) => {
                const Icon = QUESTION_BADGES[badge].icon
                return (
                  <SelectItem key={badge} value={badge}>
                    <Badge className={`flex items-center gap-1 w-fit ${QUESTION_BADGES[badge].color}`}>
                      <Icon className="h-3 w-3" />
                      <span>{QUESTION_BADGES[badge].label}</span>
                    </Badge>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground mt-1">
            Los badges ayudan a identificar el propósito de la pregunta
          </p>
        </div>
      )}

      {needsOptions(selectedType) && (
        <div>
          <Label>Opciones de respuesta</Label>
          <div className="space-y-2 mt-1">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Opción ${index + 1}`}
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar opción
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Define al menos 2 opciones. Las opciones vacías serán ignoradas.
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="defaultPoints">Puntos por defecto</Label>
        <Input
          id="defaultPoints"
          name="defaultPoints"
          type="number"
          min="1"
          max="100"
          defaultValue={template?.defaultPoints || 10}
          required
          className="mt-1"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Los puntos pueden ser personalizados al copiar la plantilla a un Grand Prix
        </p>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Cancelar
        </Button>
        <SubmitButton isEdit={isEditing} />
      </div>
    </form>
  )
}