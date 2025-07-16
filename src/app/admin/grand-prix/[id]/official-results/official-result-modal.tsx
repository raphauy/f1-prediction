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
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { QuestionInput } from '@/app/w/[slug]/predictions/[gpId]/question-input'

interface OfficialResultModalProps {
  isOpen: boolean
  onClose: () => void
  question: {
    id: string
    text: string
    type?: string | null
    category?: string | null
    points: number
    options?: Record<string, unknown>
  }
  onSave: (answer: string) => Promise<void>
  isSaving: boolean
  currentAnswer?: string
}

export function OfficialResultModal({
  isOpen,
  onClose,
  question,
  onSave,
  isSaving,
  currentAnswer
}: OfficialResultModalProps) {
  // Para preguntas booleanas, inicializar con "No" si no hay respuesta previa
  const getInitialAnswer = () => {
    if (currentAnswer) return currentAnswer
    if (question.type === 'BOOLEAN') return 'No'
    return ''
  }
  
  const [answer, setAnswer] = useState(getInitialAnswer())

  // Resetear respuesta cuando cambia la pregunta
  useEffect(() => {
    setAnswer(getInitialAnswer())
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, currentAnswer])

  const handleSave = async () => {
    if (!answer.trim()) return
    await onSave(answer)
  }

  const badge = question.category && 
    question.category in QUESTION_BADGES && 
    QUESTION_BADGES[question.category as keyof typeof QUESTION_BADGES]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Resultado Oficial
            {badge && (
              <badge.icon className="h-5 w-5" style={{ color: badge.color.match(/text-(\w+)-/)?.[1] }} />
            )}
          </DialogTitle>
          <DialogDescription>
            {question.text}
          </DialogDescription>
          <div className="text-sm text-muted-foreground">
            Valor: {question.points} puntos
          </div>
        </DialogHeader>
        
        <div className="my-4">
          <QuestionInput
            type={question.type || 'TEXT'}
            options={question.options}
            value={answer}
            onChange={setAnswer}
          />
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!answer.trim() || isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}