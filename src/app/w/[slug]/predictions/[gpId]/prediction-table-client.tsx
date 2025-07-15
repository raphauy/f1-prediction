"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Clock, Trophy, Users } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { toast } from 'sonner'
import { PredictionModal } from './prediction-modal'
import { PredictionRow } from './prediction-row'
import { savePredictionAction } from './actions'
import { QuestionCategory } from '@prisma/client'
import type { QuestionType } from './prediction-row'
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_DESCRIPTIONS } from '@/lib/constants/category-colors'
import { cn } from '@/lib/utils'

type Question = QuestionType & {
  order: number
}

interface PredictionTableClientProps {
  grandPrix: {
    id: string
    name: string
    location: string
    country: string
    circuit: string
    round: number
    qualifyingDate: Date
    raceDate: Date
    isSprint: boolean
    focusPilot?: string | null
    focusPilotContext?: string | null
  }
  questionsByCategory: {
    CLASSIC: Question[]
    PILOT_FOCUS: Question[]
    STROLLOMETER: Question[]
  }
  totalQuestions: number
  answeredQuestions: number
  userWorkspaceCount: number
  isDeadlinePassed: boolean
  workspaceSlug: string
}

export function PredictionTableClient({
  grandPrix,
  questionsByCategory,
  totalQuestions,
  answeredQuestions,
  userWorkspaceCount,
  isDeadlinePassed,
  workspaceSlug
}: PredictionTableClientProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionType | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  const handleAnswerClick = (question: QuestionType) => {
    if (isDeadlinePassed) return
    setSelectedQuestion(question)
    setIsModalOpen(true)
  }

  const handleSavePrediction = async (answer: string) => {
    if (!selectedQuestion) return

    setIsSaving(true)
    try {
      await savePredictionAction(selectedQuestion.id, answer)
      
      toast.success("Predicción guardada", {
        description: "Tu respuesta se ha guardado correctamente",
      })

      setIsModalOpen(false)
      setSelectedQuestion(null)
    } catch (error) {
      toast.error("Error al guardar", {
        description: error instanceof Error ? error.message : "No se pudo guardar tu predicción",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold">
                {grandPrix.name}
              </h1>
              {grandPrix.isSprint && (
                <Badge variant="secondary" className="bg-yellow-500 text-black w-fit">
                  Sprint
                </Badge>
              )}
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              {grandPrix.circuit}, {grandPrix.country} • Ronda {grandPrix.round}
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="w-fit">
            <Link href={`/w/${workspaceSlug}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Deadline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {format(new Date(grandPrix.qualifyingDate), "d 'de' MMMM", { locale: es })}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(grandPrix.qualifyingDate), "HH:mm", { locale: es })} hora local
              </p>
              {isDeadlinePassed && (
                <Badge variant="secondary" className="mt-2">
                  Predicciones cerradas
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Tu progreso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {answeredQuestions} / {totalQuestions}
              </p>
              <p className="text-sm text-muted-foreground">preguntas respondidas</p>
              <Progress value={progress} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Multi-juego
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{userWorkspaceCount}</p>
              <p className="text-sm text-muted-foreground">
                {userWorkspaceCount === 1 ? 'juego activo' : 'juegos activos'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tus respuestas cuentan en todos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Question sections */}
      {Object.entries(questionsByCategory).map(([category, questions]) => {
        if (questions.length === 0) return null

        const categoryKey = category as QuestionCategory
        const focusPilotName = categoryKey === 'PILOT_FOCUS' ? grandPrix.focusPilot : undefined

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-sm font-medium", CATEGORY_COLORS[categoryKey])}>
                  {CATEGORY_LABELS[categoryKey]}
                </span>
              </CardTitle>
              <CardDescription>
                {categoryKey === 'PILOT_FOCUS' && focusPilotName
                  ? `Preguntas especiales sobre ${focusPilotName}`
                  : CATEGORY_DESCRIPTIONS[categoryKey]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {questions.map((question) => (
                  <PredictionRow
                    key={question.id}
                    question={question}
                    isDeadlinePassed={isDeadlinePassed}
                    onAnswerClick={handleAnswerClick}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Prediction Modal */}
      {selectedQuestion && (
        <PredictionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedQuestion(null)
          }}
          question={selectedQuestion}
          onSave={handleSavePrediction}
          isSaving={isSaving}
          currentAnswer={selectedQuestion.userPrediction?.answer}
        />
      )}
    </div>
  )
}