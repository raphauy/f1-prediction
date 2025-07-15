"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Edit2, Lock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { QUESTION_BADGES } from '@/lib/constants/question-badges'
import { cn } from '@/lib/utils'

export interface QuestionType {
  id: string
  text: string
  badge?: string | null
  points: number
  userPrediction?: {
    id: string
    answer: string
    submittedAt: Date
    updatedAt: Date
  } | null
  type?: string
  category?: string
  order?: number
  options?: Record<string, unknown>
}

interface PredictionRowProps {
  question: QuestionType
  isDeadlinePassed: boolean
  onAnswerClick: (question: QuestionType) => void
}

export function PredictionRow({ question, isDeadlinePassed, onAnswerClick }: PredictionRowProps) {
  const hasAnswer = !!question.userPrediction
  const badgeInfo = question.badge ? QUESTION_BADGES[question.badge as keyof typeof QUESTION_BADGES] : null
  const BadgeIcon = badgeInfo?.icon

  return (
    <div className="flex items-center justify-between py-4 px-4 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{question.text}</p>
          {question.badge && badgeInfo && (
            <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", badgeInfo.color)}>
              {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
              <span>{badgeInfo.label}</span>
            </div>
          )}
        </div>
        
        {hasAnswer && (
          <div className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-muted-foreground">
              Tu respuesta: <span className="font-medium text-foreground">{question.userPrediction!.answer}</span>
            </span>
            <span className="text-xs text-muted-foreground">
              • {format(new Date(question.userPrediction!.updatedAt), "d MMM HH:mm", { locale: es })}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Badge variant="secondary" className="font-mono">
          {question.points} pts
        </Badge>

        {isDeadlinePassed ? (
          <Button size="sm" variant="ghost" disabled>
            <Lock className="h-4 w-4" />
          </Button>
        ) : hasAnswer ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAnswerClick(question)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Editar
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => onAnswerClick(question)}
          >
            Responder
          </Button>
        )}
      </div>
    </div>
  )
}