'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { CheckCircle, ChevronLeft, Trophy } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { OfficialResultModal } from './official-result-modal'
import { saveOfficialResultAction } from './actions'
import { cn } from '@/lib/utils'
import { QUESTION_BADGES } from '@/lib/constants/question-badges'

const CATEGORY_NAMES = {
  CLASSIC: 'Clásica',
  PILOT_FOCUS: 'Piloto en el Foco',
  STROLLOMETER: 'Strollómetro',
} as const

interface Question {
  id: string
  text: string
  type?: string | null
  category?: string | null
  points: number
  options?: Record<string, unknown>
  order: number
  officialAnswer: string | null
  hasResult: boolean
}

interface OfficialResultsClientProps {
  grandPrix: {
    id: string
    name: string
    location: string
    country: string
    raceDate: Date
  }
  questionsByCategory: {
    CLASSIC: Question[]
    PILOT_FOCUS: Question[]
    STROLLOMETER: Question[]
  }
  totalQuestions: number
  answeredQuestions: number
}

export function OfficialResultsClient({
  grandPrix,
  questionsByCategory,
  totalQuestions,
  answeredQuestions
}: OfficialResultsClientProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveResult = async (answer: string) => {
    if (!selectedQuestion) return
    
    setIsSaving(true)
    try {
      await saveOfficialResultAction(grandPrix.id, selectedQuestion.id, answer)
      toast.success('Resultado oficial guardado')
      setIsModalOpen(false)
      setSelectedQuestion(null)
    } catch {
      toast.error('Error al guardar el resultado')
    } finally {
      setIsSaving(false)
    }
  }

  const openModal = (question: Question) => {
    setSelectedQuestion(question)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedQuestion(null)
  }

  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/grand-prix">
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="h-6 w-6" />
                Resultados Oficiales
              </h1>
            </div>
            <p className="text-muted-foreground">
              {grandPrix.name} - {grandPrix.location}, {grandPrix.country}
            </p>
          </div>
        </div>

        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Progreso de Resultados</CardTitle>
            <CardDescription>
              {answeredQuestions} de {totalQuestions} preguntas con resultado oficial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2" />
            {progress === 100 && (
              <div className="mt-4 flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">¡Todos los resultados están completos!</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Questions by Category */}
        {Object.entries(questionsByCategory).map(([category, questions]) => {
          if (questions.length === 0) return null
          
          const categoryKey = category as keyof typeof CATEGORY_NAMES
          
          return (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{CATEGORY_NAMES[categoryKey]}</CardTitle>
                <CardDescription>
                  {questions.filter(q => q.hasResult).length} de {questions.length} con resultado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {questions.map((question) => (
                    <div
                      key={question.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors",
                        question.hasResult 
                          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                          : "hover:bg-muted"
                      )}
                      onClick={() => openModal(question)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{question.text}</span>
                          {question.category && 
                            question.category in QUESTION_BADGES && 
                            QUESTION_BADGES[question.category as keyof typeof QUESTION_BADGES] && (() => {
                              const Badge = QUESTION_BADGES[question.category as keyof typeof QUESTION_BADGES]
                              return <Badge.icon className="h-5 w-5" />
                            })()
                          }
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{question.points} puntos</span>
                          {question.hasResult && (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              Respuesta: {question.officialAnswer}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant={question.hasResult ? "default" : "secondary"}>
                        {question.hasResult ? "Completado" : "Pendiente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Modal */}
      {selectedQuestion && (
        <OfficialResultModal
          isOpen={isModalOpen}
          onClose={closeModal}
          question={selectedQuestion}
          onSave={handleSaveResult}
          isSaving={isSaving}
          currentAnswer={selectedQuestion.officialAnswer || undefined}
        />
      )}
    </>
  )
}