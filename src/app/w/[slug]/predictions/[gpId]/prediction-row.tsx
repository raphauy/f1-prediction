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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 px-3 sm:px-4 rounded-lg hover:bg-muted/50 transition-colors space-y-3 sm:space-y-0">
      <div className="flex-1 space-y-1.5">
        <p className="font-medium text-sm sm:text-base leading-tight">{question.text}</p>
        
        {/* Badge y respuesta en la misma línea en mobile */}
        <div className="flex flex-wrap items-center gap-2">
          {question.badge && badgeInfo && (
            <div className={cn(
              "inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium",
              badgeInfo.color
            )}>
              {BadgeIcon && <BadgeIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
              <span className="hidden sm:inline">{badgeInfo.label}</span>
              <span className="sm:hidden">{badgeInfo.label.split(' ')[0]}</span>
            </div>
          )}
          
          {hasAnswer && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-muted-foreground">
                <span className="hidden sm:inline">Tu respuesta:</span>
                <span className="font-medium text-foreground ml-1">{question.userPrediction!.answer}</span>
              </span>
            </div>
          )}
        </div>
        
        {hasAnswer && (
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            {format(new Date(question.userPrediction!.updatedAt), "d MMM HH:mm", { locale: es })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
        <Badge variant="secondary" className="font-mono text-xs sm:text-sm">
          {question.points} pts
        </Badge>

        {isDeadlinePassed ? (
          <Button size="sm" variant="ghost" disabled className="h-8 px-2 sm:px-3">
            <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        ) : hasAnswer ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onAnswerClick(question)}
            className="text-muted-foreground hover:text-foreground h-8 px-2 sm:px-3"
          >
            <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-0.5 sm:mr-1" />
            <span className="hidden sm:inline">Editar</span>
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => onAnswerClick(question)}
            className="h-8 px-3 sm:px-4"
          >
            Responder
          </Button>
        )}
      </div>
    </div>
  )
}