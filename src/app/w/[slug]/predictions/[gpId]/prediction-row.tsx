"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Edit2, Lock, X, AlertCircle, Clock } from 'lucide-react'
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
  isViewOnly?: boolean
  officialResult?: { answer: string } | null
  isCorrect?: boolean | null
}

export function PredictionRow({
  question,
  isDeadlinePassed,
  onAnswerClick,
  isViewOnly = false,
  officialResult,
  isCorrect
}: PredictionRowProps) {
  const hasAnswer = !!question.userPrediction
  const badgeInfo = question.badge ? QUESTION_BADGES[question.badge as keyof typeof QUESTION_BADGES] : null
  const BadgeIcon = badgeInfo?.icon
  const showResult = isViewOnly && officialResult

  // Determinar el estilo según el resultado
  const rowClassName = cn(
    "flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 px-3 sm:px-4 rounded-lg transition-colors space-y-3 sm:space-y-0",
    !isViewOnly && "hover:bg-muted/50",
    showResult && isCorrect === true && "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900",
    showResult && isCorrect === false && "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900",
    showResult && !hasAnswer && "bg-gray-50 dark:bg-gray-950/20 border border-gray-200 dark:border-gray-800"
  )

  return (
    <div className={rowClassName}>
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

          {hasAnswer && !isViewOnly && (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span className="text-muted-foreground">
                <span className="hidden sm:inline">Tu respuesta:</span>
                <span className="font-medium text-foreground ml-1">{question.userPrediction!.answer}</span>
              </span>
            </div>
          )}
        </div>

        {/* Mostrar respuestas en modo vista */}
        {isViewOnly && (
          <div className="space-y-1.5">
            {showResult ? (
              // Hay resultados oficiales cargados
              hasAnswer ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    {isCorrect === true ? (
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                    )}
                    <span className="text-muted-foreground">
                      Tu respuesta:
                      <span className={cn(
                        "font-medium ml-1",
                        isCorrect === true && "text-green-600 dark:text-green-400",
                        isCorrect === false && "text-red-600 dark:text-red-400"
                      )}>
                        {question.userPrediction!.answer}
                      </span>
                    </span>
                  </div>
                  {isCorrect === false && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">
                        Correcta:
                        <span className="font-medium text-green-600 dark:text-green-400 ml-1">
                          {officialResult.answer}
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                  <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-500 dark:text-gray-400">
                    No respondiste esta pregunta
                    {officialResult && (
                      <span className="block sm:inline sm:ml-2 text-xs">
                        • Respuesta correcta: <span className="text-green-600 dark:text-green-400 font-medium">{officialResult.answer}</span>
                      </span>
                    )}
                  </span>
                </div>
              )
            ) : (
              // No hay resultados oficiales cargados aún
              <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                <span className="text-muted-foreground">
                  {hasAnswer ? (
                    <>
                      Tu respuesta: <span className="font-medium">{question.userPrediction!.answer}</span>
                      <span className="text-xs text-blue-500 dark:text-blue-400 ml-2">(esperando resultados)</span>
                    </>
                  ) : (
                    <span className="italic text-gray-500">No respondiste • Esperando resultados</span>
                  )}
                </span>
              </div>
            )}
          </div>
        )}
        
        {hasAnswer && (
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            {format(new Date(question.userPrediction!.updatedAt), "d MMM HH:mm", { locale: es })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
        {isViewOnly ? (
          showResult ? (
            <>
              {/* Mostrar puntos obtenidos cuando hay resultados oficiales */}
              {isCorrect === true ? (
                <Badge className="font-mono text-xs sm:text-sm bg-green-600 text-white">
                  +{question.points} pts
                </Badge>
              ) : hasAnswer ? (
                <Badge variant="destructive" className="font-mono text-xs sm:text-sm">
                  0 pts
                </Badge>
              ) : (
                <Badge variant="secondary" className="font-mono text-xs sm:text-sm">
                  -{question.points} pts
                </Badge>
              )}
            </>
          ) : (
            <>
              {/* Mostrar puntos posibles cuando no hay resultados */}
              <Badge variant="outline" className="font-mono text-xs sm:text-sm text-blue-500 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                {question.points} pts
              </Badge>
            </>
          )
        ) : (
          <>
            {/* Modo normal - mostrar puntos posibles y botón */}
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
          </>
        )}
      </div>
    </div>
  )
}