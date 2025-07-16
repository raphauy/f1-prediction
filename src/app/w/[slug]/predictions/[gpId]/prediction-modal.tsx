"use client"

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { QUESTION_BADGES } from '@/lib/constants/question-badges'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { QuestionInput } from './question-input'

interface PredictionModalProps {
  isOpen: boolean
  onClose: () => void
  question: {
    id: string
    text: string
    type?: string
    badge?: string | null
    points: number
    options?: Record<string, unknown>
  }
  onSave: (answer: string) => Promise<void>
  isSaving: boolean
  currentAnswer?: string
}

export function PredictionModal({
  isOpen,
  onClose,
  question,
  onSave,
  isSaving,
  currentAnswer
}: PredictionModalProps) {
  // Para preguntas booleanas, inicializar con "No" si no hay respuesta previa
  const getInitialAnswer = () => {
    if (currentAnswer) return currentAnswer
    if (question.type === 'BOOLEAN') return 'No'
    return ''
  }

  const [answer, setAnswer] = useState(getInitialAnswer())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setAnswer(getInitialAnswer())
    setError(null)
  }, [currentAnswer, question])

  const handleSave = async () => {
    if (!answer.trim()) {
      setError('Debes seleccionar o ingresar una respuesta')
      return
    }

    setError(null)
    await onSave(answer)
  }

  const handleClose = () => {
    if (!isSaving) {
      setAnswer('')
      setError(null)
      onClose()
    }
  }

  const badgeInfo = question.badge ? QUESTION_BADGES[question.badge as keyof typeof QUESTION_BADGES] : null
  const BadgeIcon = badgeInfo?.icon

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {question.text}
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>Valor: {question.points} puntos</span>
            {question.badge && badgeInfo && (
              <div className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                badgeInfo.color
              )}>
                {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
                <span>{badgeInfo.label}</span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 overflow-y-auto flex-1">
          <QuestionInput
            type={question.type || 'MULTIPLE_CHOICE'}
            options={question.options}
            value={answer}
            onChange={setAnswer}
            error={error}
          />
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !answer}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              currentAnswer ? 'Actualizar' : 'Guardar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}