"use client"

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
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
  const [answer, setAnswer] = useState(currentAnswer || '')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setAnswer(currentAnswer || '')
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {question.text}
            {question.badge && (
              <Badge variant="outline">{question.badge}</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Valor: {question.points} puntos
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <QuestionInput
            type={question.type || 'MULTIPLE_CHOICE'}
            options={question.options}
            value={answer}
            onChange={setAnswer}
            error={error}
          />
        </div>

        <DialogFooter>
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