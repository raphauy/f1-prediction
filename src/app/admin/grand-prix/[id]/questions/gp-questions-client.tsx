'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, GripVertical, Trash2, Save, UserPlus, Loader2, Edit2, Flag, Users, HelpCircle, Hash, Binary, GitCompare, AlertTriangle } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { DRIVER_NAMES } from '@/lib/constants/drivers'
import { QUESTION_BADGES, getBadgesForType } from '@/lib/constants/question-badges'
import type { Question, GPQuestion, QuestionCategory, QuestionType, QuestionTemplate } from '@prisma/client'
import {
  addQuestionToGPAction,
  removeQuestionFromGPAction,
  updateGPQuestionAction,
  reorderGPQuestionsAction,
  createPilotFocusQuestionsAction,
  updateGrandPrixPilotAction,
  createQuestionFromTemplateAction,
  applyMultipleTemplatesAction,
} from './actions'
import type { UpdateGPQuestionData } from '@/services/question-service'
import { Textarea } from '@/components/ui/textarea'

interface GPQuestionsClientProps {
  grandPrixId: string
  gpQuestions: (GPQuestion & { 
    question: Question
    template?: QuestionTemplate | null
    _count?: {
      predictions?: number
    }
  })[]
  templates: (QuestionTemplate & {
    _count?: {
      gpQuestions?: number
    }
  })[]
  focusPilot?: string | null
  focusPilotContext?: string | null
}

export function GPQuestionsClient({
  grandPrixId,
  gpQuestions,
  templates,
  focusPilot,
  focusPilotContext,
}: GPQuestionsClientProps) {
  const router = useRouter()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [customPoints, setCustomPoints] = useState('')
  const [customText, setCustomText] = useState('')
  const [isCreatingPilotQuestion, setIsCreatingPilotQuestion] = useState(false)
  const [newQuestionText, setNewQuestionText] = useState('')
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>('MULTIPLE_CHOICE' as QuestionType)
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>(['', ''])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingPoints, setEditingPoints] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean
    questionId: string
    questionText: string
  }>({ isOpen: false, questionId: '', questionText: '' })
  const [isPilotDialogOpen, setIsPilotDialogOpen] = useState(false)
  const [selectedPilot, setSelectedPilot] = useState(focusPilot || '')
  const [pilotContext, setPilotContext] = useState(focusPilotContext || '')
  const [isCreatingPilotQuestions, setIsCreatingPilotQuestions] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingGPQuestion, setEditingGPQuestion] = useState<(GPQuestion & { question: Question }) | null>(null)
  const [editQuestionText, setEditQuestionText] = useState('')
  const [editQuestionType, setEditQuestionType] = useState<QuestionType>('MULTIPLE_CHOICE' as QuestionType)
  const [editQuestionOptions, setEditQuestionOptions] = useState<string[]>(['', ''])
  const [editQuestionPoints, setEditQuestionPoints] = useState('')
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)
  const [isUpdatingQuestion, setIsUpdatingQuestion] = useState(false)
  const [isCustomQuestionDialogOpen, setIsCustomQuestionDialogOpen] = useState(false)
  const [customQuestionCategory, setCustomQuestionCategory] = useState<QuestionCategory>('CLASSIC' as QuestionCategory)
  const [customQuestionBadge, setCustomQuestionBadge] = useState<string>('none')

  // Ordenar las preguntas por orden
  const [sortedQuestions, setSortedQuestions] = useState(() => 
    [...gpQuestions].sort((a, b) => a.order - b.order)
  )
  
  // Configuración de sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Agrupar preguntas por categoría
  const questionsByCategory = sortedQuestions.reduce((acc, gpQuestion) => {
    const category = gpQuestion.question.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(gpQuestion)
    return acc
  }, {} as Record<QuestionCategory, typeof sortedQuestions>)

  const categoryLabels: Record<QuestionCategory, string> = {
    CLASSIC: 'Preguntas Clásicas',
    PILOT_FOCUS: 'Piloto en el Foco',
    STROLLOMETER: 'Strollómetro',
  }

  const categoryColors: Record<QuestionCategory, string> = {
    CLASSIC: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    PILOT_FOCUS: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    STROLLOMETER: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  }

  const questionTypeColors: Record<QuestionType, string> = {
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

  const questionTypeLabels: Record<QuestionType, string> = {
    DRIVERS: 'Pilotos',
    TEAMS: 'Equipos',
    MULTIPLE_CHOICE: 'Opción Múltiple',
    NUMERIC: 'Numérico',
    BOOLEAN: 'Sí/No',
    HEAD_TO_HEAD: 'H2H',
  }

  // Helper para verificar si una pregunta tiene opciones válidas
  const hasValidOptions = (gpQuestion: GPQuestion & { question: Question }) => {
    const type = gpQuestion.type || gpQuestion.question.type
    
    // Solo verificar para tipos que requieren opciones
    if (!['MULTIPLE_CHOICE', 'HEAD_TO_HEAD'].includes(type)) {
      return true
    }
    
    // Verificar si tiene opciones - primero en gpQuestion, luego en question
    let options = gpQuestion.options
    if (!options && gpQuestion.question) {
      options = gpQuestion.question.options
    }
    
    if (!options || typeof options !== 'object') {
      return false
    }
    
    const opts = options as { type?: string; values?: string[] | null }
    
    // Si es tipo 'custom' necesita values
    if (opts.type === 'custom') {
      if (!opts.values || !Array.isArray(opts.values)) {
        return false
      }
      
      // Debe tener al menos 2 opciones no vacías
      const validOptions = opts.values.filter(v => v && typeof v === 'string' && v.trim() !== '')
      return validOptions.length >= 2
    }
    
    // Para otros tipos (drivers, teams, etc) está ok
    return true
  }

  const addOption = () => {
    setNewQuestionOptions([...newQuestionOptions, ''])
  }

  const removeOption = (index: number) => {
    if (newQuestionOptions.length > 2) { // Mínimo 2 opciones
      setNewQuestionOptions(newQuestionOptions.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...newQuestionOptions]
    updatedOptions[index] = value
    setNewQuestionOptions(updatedOptions)
  }

  const addEditOption = () => {
    setEditQuestionOptions([...editQuestionOptions, ''])
  }

  const removeEditOption = (index: number) => {
    if (editQuestionOptions.length > 2) {
      setEditQuestionOptions(editQuestionOptions.filter((_, i) => i !== index))
    }
  }

  const updateEditOption = (index: number, value: string) => {
    const updatedOptions = [...editQuestionOptions]
    updatedOptions[index] = value
    setEditQuestionOptions(updatedOptions)
  }

  const handleAddQuestion = async () => {
    if (isCreatingPilotQuestion) {
      // Crear pregunta inline para piloto
      if (!newQuestionText || !customPoints) {
        toast.error('Completa el texto de la pregunta y asigna puntos')
        return
      }

      setIsAddingQuestion(true)
      try {
        const result = await addQuestionToGPAction({
          grandPrixId,
          points: parseInt(customPoints),
          order: sortedQuestions.length + 1,
          text: newQuestionText,
          type: newQuestionType,
          category: 'PILOT_FOCUS',
          options: newQuestionType === 'MULTIPLE_CHOICE' 
            ? { type: 'custom', values: newQuestionOptions.filter(opt => opt.trim() !== '') }
            : newQuestionType === 'BOOLEAN'
            ? { type: 'boolean' }
            : { type: 'numeric' }
        })

        if (result.success) {
          toast.success('Pregunta del piloto agregada correctamente')
          setIsAddDialogOpen(false)
          setNewQuestionText('')
          setNewQuestionType('MULTIPLE_CHOICE' as QuestionType)
          setCustomPoints('')
          setIsCreatingPilotQuestion(false)
          setNewQuestionOptions(['', ''])
          router.refresh()
        } else {
          toast.error(result.error || 'Error al agregar la pregunta')
        }
      } catch {
        toast.error('Error al agregar la pregunta')
      } finally {
        setIsAddingQuestion(false)
      }
    } else {
      // Crear pregunta desde plantilla
      if (!selectedTemplateId || !customPoints) {
        toast.error('Selecciona una plantilla y asigna puntos')
        return
      }

      setIsAddingQuestion(true)
      try {
        const result = await createQuestionFromTemplateAction(
          selectedTemplateId,
          grandPrixId,
          {
            points: parseInt(customPoints),
            text: customText || undefined,
          }
        )

        if (result.success) {
          toast.success('Pregunta creada desde plantilla correctamente')
          setIsAddDialogOpen(false)
          setSelectedTemplateId('')
          setCustomPoints('')
          setCustomText('')
          router.refresh()
        } else {
          toast.error(result.error || 'Error al crear la pregunta')
        }
      } catch {
        toast.error('Error al crear la pregunta')
      } finally {
        setIsAddingQuestion(false)
      }
    }
  }

  const handleRemoveQuestion = async () => {
    try {
      const result = await removeQuestionFromGPAction(grandPrixId, deleteDialog.questionId)
      
      if (result.success) {
        toast.success('Pregunta eliminada correctamente')
        router.refresh()
      } else {
        toast.error(result.error || 'Error al eliminar la pregunta')
      }
    } catch {
      toast.error('Error al eliminar la pregunta')
    } finally {
      setDeleteDialog({ isOpen: false, questionId: '', questionText: '' })
    }
  }

  const openDeleteDialog = (gpQuestion: GPQuestion & { question: Question }, questionText: string) => {
    // Para preguntas inline, usar el ID con prefijo "inline-"
    const questionId = gpQuestion.questionId || `inline-${gpQuestion.id}`
    setDeleteDialog({
      isOpen: true,
      questionId,
      questionText,
    })
  }

  const handleUpdatePoints = async (gpQuestionId: string) => {
    try {
      const result = await updateGPQuestionAction(gpQuestionId, {
        points: parseInt(editingPoints),
      })

      if (result.success) {
        toast.success('Puntos actualizados correctamente')
        setEditingId(null)
        setEditingPoints('')
        router.refresh()
      } else {
        toast.error(result.error || 'Error al actualizar los puntos')
      }
    } catch {
      toast.error('Error al actualizar los puntos')
    }
  }

  const handleApplyStandardQuestions = async () => {
    setIsApplying(true)
    try {
      // Obtener todos los IDs de plantillas
      const templateIds = templates.map(t => t.id)
      const result = await applyMultipleTemplatesAction(grandPrixId, templateIds)
      
      if (result.success) {
        toast.success(`${templateIds.length} plantillas aplicadas correctamente`)
        router.refresh()
      } else {
        toast.error(result.error || 'Error al aplicar plantillas')
      }
    } catch {
      toast.error('Error al aplicar plantillas')
    } finally {
      setIsApplying(false)
    }
  }

  const startEditingPoints = (gpQuestion: GPQuestion) => {
    setEditingId(gpQuestion.id)
    setEditingPoints(gpQuestion.points.toString())
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingPoints('')
  }

  const startEditingQuestion = (gpQuestion: GPQuestion & { question: Question }) => {
    setEditingGPQuestion(gpQuestion)
    setEditQuestionText(gpQuestion.text || '')
    setEditQuestionType(gpQuestion.type as QuestionType)
    setEditQuestionPoints(gpQuestion.points.toString())
    
    // Si la pregunta tiene opciones personalizadas, cargarlas
    if (gpQuestion.options && typeof gpQuestion.options === 'object') {
      const opts = gpQuestion.options as { type: string; values?: string[] }
      if (opts.type === 'custom' && Array.isArray(opts.values)) {
        setEditQuestionOptions(opts.values)
      } else {
        setEditQuestionOptions(['', ''])
      }
    } else {
      setEditQuestionOptions(['', ''])
    }
    
    setIsEditDialogOpen(true)
  }

  const handleUpdateQuestion = async () => {
    if (!editingGPQuestion) return
    
    if (!editQuestionText.trim()) {
      toast.error('El texto de la pregunta no puede estar vacío')
      return
    }

    setIsUpdatingQuestion(true)
    try {
      const updateData: UpdateGPQuestionData = {
        text: editQuestionText,
        type: editQuestionType,
        points: parseInt(editQuestionPoints),
      }

      // Configurar opciones según el tipo de pregunta
      switch (editQuestionType) {
        case 'MULTIPLE_CHOICE':
        case 'HEAD_TO_HEAD':
          const validOptions = editQuestionOptions.filter(opt => opt.trim() !== '')
          if (validOptions.length < 2) {
            toast.error('Debes proporcionar al menos 2 opciones')
            setIsUpdatingQuestion(false)
            return
          }
          updateData.options = { type: 'custom', values: validOptions }
          break
        case 'NUMERIC':
          updateData.options = { type: 'numeric' }
          break
        case 'DRIVERS':
          updateData.options = { type: 'drivers' }
          break
        case 'TEAMS':
          updateData.options = { type: 'teams' }
          break
        case 'BOOLEAN':
          updateData.options = { type: 'custom', values: ['Sí', 'No'] }
          break
      }

      const result = await updateGPQuestionAction(editingGPQuestion.id, updateData)

      if (result.success) {
        toast.success('Pregunta actualizada correctamente')
        setIsEditDialogOpen(false)
        setEditingGPQuestion(null)
        setEditQuestionText('')
        setEditQuestionType('MULTIPLE_CHOICE' as QuestionType)
        setEditQuestionOptions(['', ''])
        setEditQuestionPoints('')
        router.refresh()
      } else {
        toast.error(result.error || 'Error al actualizar la pregunta')
      }
    } catch {
      toast.error('Error al actualizar la pregunta')
    } finally {
      setIsUpdatingQuestion(false)
    }
  }

  const handleCreatePilotQuestions = async () => {
    // Si ya hay un piloto, usar ese; si no, usar el seleccionado
    const pilotToUse = focusPilot || selectedPilot
    
    if (!pilotToUse) {
      toast.error('Selecciona un piloto')
      return
    }

    setIsCreatingPilotQuestions(true)
    try {
      // Si no hay piloto en el GP, primero actualizar el Grand Prix
      if (!focusPilot) {
        const updateResult = await updateGrandPrixPilotAction(grandPrixId, selectedPilot, pilotContext)
        
        if (!updateResult.success) {
          toast.error(updateResult.error || 'Error al actualizar el piloto')
          return
        }
      }

      // Luego crear las preguntas estándar
      const result = await createPilotFocusQuestionsAction(grandPrixId, pilotToUse)
      
      if (result.success) {
        toast.success('Preguntas del piloto creadas correctamente')
        setIsPilotDialogOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || 'Error al crear las preguntas')
      }
    } catch {
      toast.error('Error al crear las preguntas del piloto')
    } finally {
      setIsCreatingPilotQuestions(false)
    }
  }

  // Manejo del drag and drop
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      return
    }
    
    // Encontrar los índices
    const oldIndex = sortedQuestions.findIndex((q) => q.id === active.id)
    const newIndex = sortedQuestions.findIndex((q) => q.id === over.id)
    
    if (oldIndex === -1 || newIndex === -1) {
      return
    }
    
    // Actualizar el estado local inmediatamente para feedback visual
    const newQuestions = arrayMove(sortedQuestions, oldIndex, newIndex)
    setSortedQuestions(newQuestions)
    
    // Crear array con los nuevos órdenes
    const questionOrders = newQuestions.map((q, index) => ({
      id: q.id,
      order: index + 1,
    }))
    
    try {
      const result = await reorderGPQuestionsAction(grandPrixId, questionOrders)
      
      if (result.success) {
        toast.success('Orden actualizado')
        router.refresh()
      } else {
        toast.error('Error al reordenar las preguntas')
        // Revertir el cambio si falla
        setSortedQuestions(sortedQuestions)
      }
    } catch {
      toast.error('Error al reordenar las preguntas')
      // Revertir el cambio si falla
      setSortedQuestions(sortedQuestions)
    }
  }
  
  // Componente para fila arrastrable
  function SortableRow({ gpQuestion, children }: { gpQuestion: typeof sortedQuestions[0], children: React.ReactNode }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: gpQuestion.id })
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }
    
    return (
      <TableRow ref={setNodeRef} style={style}>
        <TableCell>
          <div className="flex items-center gap-1">
            <div {...attributes} {...listeners}>
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
            </div>
            <span className="font-medium">{gpQuestion.order}</span>
          </div>
        </TableCell>
        {children}
      </TableRow>
    )
  }

  return (
    <div className="space-y-6">
      {/* Acciones superiores */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {sortedQuestions.length} pregunta{sortedQuestions.length !== 1 ? 's' : ''} configurada{sortedQuestions.length !== 1 ? 's' : ''}
        </div>
        <div className="flex gap-2">
          {templates.length > 0 && (
            <Button
              variant="outline"
              onClick={handleApplyStandardQuestions}
              disabled={isApplying}
            >
              {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Aplicar todas las plantillas
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setIsCustomQuestionDialogOpen(true)
              setNewQuestionText('')
              setNewQuestionType('MULTIPLE_CHOICE' as QuestionType)
              setNewQuestionOptions(['', ''])
              setCustomPoints('10')
              setCustomQuestionBadge('none')
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Crear Pregunta Personalizada
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agregar desde Plantilla
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isCreatingPilotQuestion 
                    ? `Agregar Pregunta sobre ${focusPilot}` 
                    : 'Agregar Pregunta al Grand Prix'}
                </DialogTitle>
                <DialogDescription>
                  {isCreatingPilotQuestion
                    ? 'Crea una pregunta personalizada sobre el piloto en foco'
                    : 'Selecciona una plantilla y personaliza la pregunta para este GP'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {isCreatingPilotQuestion ? (
                  <>
                    <div>
                      <Label htmlFor="questionText">Texto de la pregunta</Label>
                      <Input
                        id="questionText"
                        value={newQuestionText}
                        onChange={(e) => setNewQuestionText(e.target.value)}
                        placeholder={`ej: ¿${focusPilot} logrará el podio?`}
                      />
                    </div>
                    <div>
                      <Label htmlFor="questionType">Tipo de pregunta</Label>
                      <input type="hidden" name="type" value={newQuestionType} />
                      <Select 
                        value={newQuestionType}
                        onValueChange={(value) => setNewQuestionType(value as QuestionType)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecciona el tipo de pregunta" />
                        </SelectTrigger>
                        <SelectContent>
                          {(['MULTIPLE_CHOICE', 'BOOLEAN', 'NUMERIC'] as QuestionType[]).map((type) => (
                            <SelectItem key={type} value={type}>
                              <Badge 
                                variant="outline" 
                                className={`flex items-center gap-1 w-fit ${questionTypeColors[type]}`}
                              >
                                {questionTypeIcons[type]}
                                <span>{questionTypeLabels[type]}</span>
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {newQuestionType === 'MULTIPLE_CHOICE' && (
                      <div>
                        <Label>Opciones de respuesta</Label>
                        <div className="space-y-2 mt-2">
                          {newQuestionOptions.map((option, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(index, e.target.value)}
                                placeholder={`Opción ${index + 1}`}
                              />
                              {newQuestionOptions.length > 2 && (
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeOption(index)}
                                  className="h-9 w-9 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addOption}
                          className="mt-2"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar opción
                        </Button>
                        <p className="text-sm text-muted-foreground mt-1">
                          Define al menos 2 opciones. Las opciones vacías serán ignoradas.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="template">Plantilla</Label>
                      <select
                        id="template"
                        className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                        value={selectedTemplateId}
                        onChange={(e) => {
                          setSelectedTemplateId(e.target.value)
                          const template = templates.find(t => t.id === e.target.value)
                          if (template) {
                            setCustomPoints(template.defaultPoints.toString())
                            setCustomText(template.text)
                          }
                        }}
                      >
                        <option value="">Selecciona una plantilla</option>
                        <optgroup label="Preguntas Clásicas">
                          {templates.filter(t => t.category === 'CLASSIC').map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.text} (por defecto: {template.defaultPoints} pts)
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Strollómetro">
                          {templates.filter(t => t.category === 'STROLLOMETER').map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.text} (por defecto: {template.defaultPoints} pts)
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="customText">Texto de la pregunta (opcional)</Label>
                      <Input
                        id="customText"
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Deja vacío para usar el texto de la plantilla"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Puedes personalizar el texto de la pregunta para este GP específico
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="points">Puntos para este GP</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    max="100"
                    value={customPoints}
                    onChange={(e) => setCustomPoints(e.target.value)}
                    placeholder="Puntos"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddDialogOpen(false)
                      setSelectedTemplateId('')
                      setCustomText('')
                      setCustomPoints('')
                      setIsCreatingPilotQuestion(false)
                      setNewQuestionText('')
                      setNewQuestionType('MULTIPLE_CHOICE' as QuestionType)
                      setNewQuestionOptions(['', ''])
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddQuestion} disabled={isAddingQuestion}>
                    {isAddingQuestion && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Agregar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tablas de preguntas por categoría */}
      {sortedQuestions.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-muted-foreground">
          No hay preguntas configuradas para este Grand Prix
        </div>
      ) : (
        <div className="space-y-6">
          {(['CLASSIC', 'PILOT_FOCUS', 'STROLLOMETER'] as QuestionCategory[]).map((category) => {
            const questions = questionsByCategory[category] || []
            if (questions.length === 0 && category !== 'PILOT_FOCUS') return null
            // Siempre mostrar la sección de PILOT_FOCUS

            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{categoryLabels[category]}</h3>
                    <Badge className={categoryColors[category]}>
                      {questions.length} pregunta{questions.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  {category === 'PILOT_FOCUS' && (
                    <div className="flex items-center gap-2">
                      {focusPilot && (
                        <>
                          <div className="text-sm text-muted-foreground">
                            Piloto: <span className="font-medium">{focusPilot}</span>
                            {focusPilotContext && (
                              <span className="ml-2 text-xs">({focusPilotContext})</span>
                            )}
                          </div>
                          {/* Botón para agregar pregunta personalizada de piloto */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsAddDialogOpen(true)
                              setIsCreatingPilotQuestion(true)
                              setNewQuestionText('')
                              setNewQuestionType('MULTIPLE_CHOICE' as QuestionType)
                              setCustomPoints('5')
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Agregar Pregunta
                          </Button>
                        </>
                      )}
                      {/* Mostrar botón si no hay piloto O si hay piloto pero no hay preguntas */}
                      {(!focusPilot || (focusPilot && questions.length === 0)) && (
                        <Dialog open={isPilotDialogOpen} onOpenChange={setIsPilotDialogOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <UserPlus className="mr-2 h-4 w-4" />
                              {focusPilot ? 'Crear Preguntas Estándar' : 'Seleccionar Piloto'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Configurar Piloto en el Foco</DialogTitle>
                              <DialogDescription>
                                {focusPilot 
                                  ? `Crear preguntas estándar para ${focusPilot}` 
                                  : 'Selecciona el piloto destacado para este Grand Prix. Se crearán 4 preguntas estándar.'}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {!focusPilot && (
                                <div>
                                  <Label htmlFor="pilot">Piloto</Label>
                                  <select
                                    id="pilot"
                                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                                    value={selectedPilot}
                                    onChange={(e) => setSelectedPilot(e.target.value)}
                                  >
                                    <option value="">Selecciona un piloto</option>
                                    {DRIVER_NAMES.map((driver) => (
                                      <option key={driver} value={driver}>
                                        {driver}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              )}
                              {!focusPilot && (
                                <div>
                                  <Label htmlFor="context">Contexto (opcional)</Label>
                                  <Textarea
                                    id="context"
                                    value={pilotContext}
                                    onChange={(e) => setPilotContext(e.target.value)}
                                    placeholder="ej: Debut en Ferrari, último GP con el equipo, etc."
                                    rows={3}
                                  />
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Explica por qué este piloto es relevante para este GP
                                  </p>
                                </div>
                              )}
                              {focusPilot && (
                                <div className="space-y-2">
                                  <p className="text-sm">Se crearán las siguientes preguntas:</p>
                                  <ul className="text-sm space-y-1 ml-4 list-disc">
                                    <li>¿En qué posición clasificará {focusPilot}?</li>
                                    <li>¿En qué posición terminará {focusPilot} la carrera?</li>
                                    <li>¿{focusPilot} ganará posiciones en carrera respecto a la clasificación?</li>
                                    <li>¿{focusPilot} terminará por delante de su compañero de equipo?</li>
                                  </ul>
                                </div>
                              )}
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsPilotDialogOpen(false)
                                    setSelectedPilot(focusPilot || '')
                                    setPilotContext(focusPilotContext || '')
                                  }}
                                >
                                  Cancelar
                                </Button>
                                <Button 
                                  onClick={handleCreatePilotQuestions}
                                  disabled={(!selectedPilot && !focusPilot) || isCreatingPilotQuestions}
                                >
                                  {isCreatingPilotQuestions && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Crear Preguntas
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  )}
                </div>
                
                {questions.length === 0 && category === 'PILOT_FOCUS' ? (
                  <div className="rounded-md border p-4 text-center text-muted-foreground">
                    {focusPilot ? (
                      <>
                        <p>No hay preguntas del piloto en foco.</p>
                        <p className="text-sm mt-1">Usa el botón &quot;Agregar Pregunta&quot; para crear preguntas personalizadas sobre {focusPilot}.</p>
                      </>
                    ) : (
                      <>
                        <p>No hay piloto seleccionado para este Grand Prix.</p>
                        <p className="text-sm mt-1">Usa el botón &quot;Seleccionar Piloto&quot; para elegir el piloto destacado y crear preguntas automáticamente.</p>
                      </>
                    )}
                  </div>
                ) : questions.length > 0 ? (
                <div className="rounded-md border">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Orden</TableHead>
                          <TableHead>Pregunta</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-center">Puntos</TableHead>
                          <TableHead className="text-center">Predicciones</TableHead>
                          <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <SortableContext
                          items={questions.map(q => q.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {questions.map((gpQuestion) => (
                            <SortableRow key={gpQuestion.id} gpQuestion={gpQuestion}>
                              <TableCell className="font-medium">
                                {gpQuestion.question.text}
                              </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {(() => {
                                const type = (gpQuestion.type || gpQuestion.question.type) as QuestionType
                                const needsOptions = ['MULTIPLE_CHOICE', 'HEAD_TO_HEAD'].includes(type)
                                const hasOptions = hasValidOptions(gpQuestion)
                                
                                return (
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant="outline" 
                                      className={`flex items-center gap-1 w-fit ${questionTypeColors[type]}`}
                                    >
                                      {questionTypeIcons[type]}
                                      <span>{questionTypeLabels[type] || type}</span>
                                    </Badge>
                                    {needsOptions && !hasOptions && (
                                      <div title="Esta pregunta requiere al menos 2 opciones">
                                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                      </div>
                                    )}
                                  </div>
                                )
                              })()}
                              {(gpQuestion.badge || gpQuestion.question.badge) && (() => {
                                const badgeKey = (gpQuestion.badge || gpQuestion.question.badge) as keyof typeof QUESTION_BADGES
                                const badgeData = QUESTION_BADGES[badgeKey]
                                if (!badgeData) return null
                                const Icon = badgeData.icon
                                return (
                                  <Badge className={`flex items-center gap-1 w-fit ${badgeData.color}`}>
                                    <Icon className="h-3 w-3" />
                                    <span>{badgeData.label}</span>
                                  </Badge>
                                )
                              })()}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {editingId === gpQuestion.id ? (
                              <div className="flex items-center gap-1 justify-center">
                                <Input
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={editingPoints}
                                  onChange={(e) => setEditingPoints(e.target.value)}
                                  className="w-20 h-8"
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => handleUpdatePoints(gpQuestion.id)}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={cancelEditing}
                                >
                                  ×
                                </Button>
                              </div>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="cursor-pointer"
                                onClick={() => startEditingPoints(gpQuestion)}
                              >
                                {gpQuestion.points} pts
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {gpQuestion._count?.predictions || 0}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => startEditingQuestion(gpQuestion)}
                                title="Editar pregunta"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => openDeleteDialog(gpQuestion, gpQuestion.text || '')}
                                disabled={(gpQuestion._count?.predictions || 0) > 0}
                                title="Eliminar pregunta"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                            </SortableRow>
                          ))}
                        </SortableContext>
                      </TableBody>
                    </Table>
                  </DndContext>
                </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      {sortedQuestions.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <p>• Haz clic en los puntos para editarlos</p>
          <p>• Las preguntas de Piloto en el Foco pueden ser editadas con el botón ✏️</p>
          <p>• Las preguntas con predicciones no pueden ser eliminadas</p>
          <p>• Las preguntas de Opción Múltiple o Head to Head requieren al menos 2 opciones ⚠️</p>
          <p>• Arrastra las preguntas para reordenarlas</p>
        </div>
      )}

      {/* AlertDialog para confirmar eliminación */}
      <AlertDialog 
        open={deleteDialog.isOpen} 
        onOpenChange={(open) => !open && setDeleteDialog({ isOpen: false, questionId: '', questionText: '' })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar pregunta?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la pregunta &quot;{deleteDialog.questionText}&quot; de este Grand Prix. 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveQuestion}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para editar pregunta */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pregunta</DialogTitle>
            <DialogDescription>
              Modifica el texto, tipo y puntos de la pregunta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editQuestionText">Texto de la pregunta</Label>
              <Input
                id="editQuestionText"
                value={editQuestionText}
                onChange={(e) => setEditQuestionText(e.target.value)}
                placeholder="Ingresa el texto de la pregunta"
              />
            </div>
            <div>
              <Label htmlFor="editQuestionType">Tipo de pregunta</Label>
              <input type="hidden" name="type" value={editQuestionType} />
              <Select 
                value={editQuestionType}
                onValueChange={(value) => setEditQuestionType(value as QuestionType)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona el tipo de pregunta" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(questionTypeLabels).map(([value]) => {
                    const type = value as QuestionType
                    return (
                      <SelectItem key={value} value={value}>
                        <Badge 
                          variant="outline" 
                          className={`flex items-center gap-1 w-fit ${questionTypeColors[type]}`}
                        >
                          {questionTypeIcons[type]}
                          <span>{questionTypeLabels[type]}</span>
                        </Badge>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            {['MULTIPLE_CHOICE', 'HEAD_TO_HEAD'].includes(editQuestionType) && (
              <div>
                <Label>Opciones de respuesta</Label>
                <div className="space-y-2 mt-2">
                  {editQuestionOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateEditOption(index, e.target.value)}
                        placeholder={`Opción ${index + 1}`}
                      />
                      {editQuestionOptions.length > 2 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeEditOption(index)}
                          className="h-9 w-9 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addEditOption}
                  className="mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar opción
                </Button>
                <p className="text-sm text-muted-foreground mt-1">
                  Define al menos 2 opciones. Las opciones vacías serán ignoradas.
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="editPoints">Puntos para este GP</Label>
              <Input
                id="editPoints"
                type="number"
                min="1"
                max="100"
                value={editQuestionPoints}
                onChange={(e) => setEditQuestionPoints(e.target.value)}
                placeholder="Puntos"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingGPQuestion(null)
                  setEditQuestionText('')
                  setEditQuestionType('MULTIPLE_CHOICE' as QuestionType)
                  setEditQuestionOptions(['', ''])
                  setEditQuestionPoints('')
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleUpdateQuestion} disabled={isUpdatingQuestion}>
                {isUpdatingQuestion && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Diálogo para crear pregunta personalizada */}
      <Dialog open={isCustomQuestionDialogOpen} onOpenChange={setIsCustomQuestionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Pregunta Personalizada</DialogTitle>
            <DialogDescription>
              Crea una pregunta única para este Grand Prix sin usar plantillas
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customQuestionText">Texto de la pregunta</Label>
              <Input
                id="customQuestionText"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="ej: ¿Quién ganará la carrera?"
              />
            </div>
            <div>
              <Label htmlFor="customQuestionCategory">Categoría</Label>
              <input type="hidden" name="category" value={customQuestionCategory} />
              <Select 
                value={customQuestionCategory}
                onValueChange={(value) => setCustomQuestionCategory(value as QuestionCategory)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona la categoría" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => {
                    const category = value as QuestionCategory
                    return (
                      <SelectItem key={value} value={value}>
                        <Badge 
                          variant="outline" 
                          className={categoryColors[category]}
                        >
                          {label}
                        </Badge>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="customQuestionType">Tipo de pregunta</Label>
              <input type="hidden" name="type" value={newQuestionType} />
              <Select 
                value={newQuestionType}
                onValueChange={(value) => setNewQuestionType(value as QuestionType)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona el tipo de pregunta" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(questionTypeLabels).map(([value]) => {
                    const type = value as QuestionType
                    return (
                      <SelectItem key={value} value={value}>
                        <Badge 
                          variant="outline" 
                          className={`flex items-center gap-1 w-fit ${questionTypeColors[type]}`}
                        >
                          {questionTypeIcons[type]}
                          <span>{questionTypeLabels[type]}</span>
                        </Badge>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            {getBadgesForType(newQuestionType).length > 0 && (
              <div>
                <Label htmlFor="customQuestionBadge">Badge (opcional)</Label>
                <input type="hidden" name="badge" value={customQuestionBadge} />
                <Select 
                  value={customQuestionBadge}
                  onValueChange={setCustomQuestionBadge}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sin badge" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin badge</SelectItem>
                    {getBadgesForType(newQuestionType).map((badge) => {
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
            {['MULTIPLE_CHOICE', 'HEAD_TO_HEAD'].includes(newQuestionType) && (
              <div>
                <Label>Opciones de respuesta</Label>
                <div className="space-y-2 mt-2">
                  {newQuestionOptions.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Opción ${index + 1}`}
                      />
                      {newQuestionOptions.length > 2 && (
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          onClick={() => removeOption(index)}
                          className="h-9 w-9 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
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
              <Label htmlFor="customQuestionPoints">Puntos</Label>
              <Input
                id="customQuestionPoints"
                type="number"
                min="1"
                max="100"
                value={customPoints}
                onChange={(e) => setCustomPoints(e.target.value)}
                placeholder="10"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCustomQuestionDialogOpen(false)
                  setNewQuestionText('')
                  setNewQuestionType('MULTIPLE_CHOICE' as QuestionType)
                  setNewQuestionOptions(['', ''])
                  setCustomPoints('10')
                  setCustomQuestionCategory('CLASSIC' as QuestionCategory)
                  setCustomQuestionBadge('none')
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={async () => {
                  if (!newQuestionText.trim()) {
                    toast.error('El texto de la pregunta no puede estar vacío')
                    return
                  }

                  if (!customPoints || parseInt(customPoints) < 1) {
                    toast.error('Los puntos deben ser al menos 1')
                    return
                  }

                  setIsAddingQuestion(true)
                  try {
                    // Configurar opciones según el tipo de pregunta
                    let options = undefined
                    switch (newQuestionType) {
                      case 'MULTIPLE_CHOICE':
                      case 'HEAD_TO_HEAD':
                        const validOptions = newQuestionOptions.filter(opt => opt.trim() !== '')
                        if (validOptions.length < 2) {
                          toast.error('Debes proporcionar al menos 2 opciones')
                          setIsAddingQuestion(false)
                          return
                        }
                        options = { type: 'custom', values: validOptions }
                        break
                      case 'NUMERIC':
                        options = { type: 'numeric' }
                        break
                      case 'DRIVERS':
                        options = { type: 'drivers' }
                        break
                      case 'TEAMS':
                        options = { type: 'teams' }
                        break
                      case 'BOOLEAN':
                        options = { type: 'custom', values: ['Sí', 'No'] }
                        break
                    }

                    const result = await addQuestionToGPAction({
                      grandPrixId,
                      points: parseInt(customPoints),
                      order: sortedQuestions.length + 1,
                      text: newQuestionText,
                      type: newQuestionType,
                      category: customQuestionCategory,
                      badge: customQuestionBadge !== 'none' ? customQuestionBadge : undefined,
                      options,
                    })

                    if (result.success) {
                      toast.success('Pregunta creada correctamente')
                      setIsCustomQuestionDialogOpen(false)
                      setNewQuestionText('')
                      setNewQuestionType('MULTIPLE_CHOICE' as QuestionType)
                      setNewQuestionOptions(['', ''])
                      setCustomPoints('10')
                      setCustomQuestionCategory('CLASSIC' as QuestionCategory)
                      setCustomQuestionBadge('none')
                      router.refresh()
                    } else {
                      toast.error(result.error || 'Error al crear la pregunta')
                    }
                  } catch {
                    toast.error('Error al crear la pregunta')
                  } finally {
                    setIsAddingQuestion(false)
                  }
                }} 
                disabled={isAddingQuestion}
              >
                {isAddingQuestion && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Pregunta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}