'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { QuestionsActionsClient } from './questions-actions-client'
import type { Question, QuestionType, QuestionCategory } from '@prisma/client'
import { Trophy, Clock, Zap, Target, Flag, Users, HelpCircle, Hash, Binary, GitCompare } from 'lucide-react'

interface QuestionsTableClientProps {
  questions: (Question & {
    _count?: {
      gpQuestions?: number
    }
  })[]
}

const questionTypeIcons: Record<QuestionType, React.ReactNode> = {
  WINNER: <Trophy className="h-4 w-4" />,
  POLE_POSITION: <Target className="h-4 w-4" />,
  FASTEST_LAP: <Zap className="h-4 w-4" />,
  PODIUM: <Flag className="h-4 w-4" />,
  TEAM_WINNER: <Users className="h-4 w-4" />,
  DNF: <Clock className="h-4 w-4" />,
  POINTS_FINISH: <HelpCircle className="h-4 w-4" />,
  MULTIPLE_CHOICE: <HelpCircle className="h-4 w-4" />,
  NUMERIC: <Hash className="h-4 w-4" />,
  BOOLEAN: <Binary className="h-4 w-4" />,
  HEAD_TO_HEAD: <GitCompare className="h-4 w-4" />,
}

const questionTypeLabels: Record<QuestionType, string> = {
  WINNER: 'Ganador',
  POLE_POSITION: 'Pole Position',
  FASTEST_LAP: 'Vuelta Rápida',
  PODIUM: 'Podio',
  TEAM_WINNER: 'Equipo Ganador',
  DNF: 'DNF',
  POINTS_FINISH: 'Puntos',
  MULTIPLE_CHOICE: 'Opción Múltiple',
  NUMERIC: 'Numérico',
  BOOLEAN: 'Sí/No',
  HEAD_TO_HEAD: 'H2H',
}

const categoryLabels: Record<QuestionCategory, string> = {
  CLASSIC: 'Clásica',
  PILOT_FOCUS: 'Piloto Foco',
  STROLLOMETER: 'Strollómetro',
}

const categoryColors: Record<QuestionCategory, string> = {
  CLASSIC: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  PILOT_FOCUS: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  STROLLOMETER: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
}

const questionTypeColors: Record<QuestionType, string> = {
  WINNER: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  POLE_POSITION: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  FASTEST_LAP: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  PODIUM: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  TEAM_WINNER: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  DNF: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  POINTS_FINISH: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  MULTIPLE_CHOICE: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  NUMERIC: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  BOOLEAN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  HEAD_TO_HEAD: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
}

export function QuestionsTableClient({ questions }: QuestionsTableClientProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pregunta</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-center">Puntos por defecto</TableHead>
            <TableHead className="text-center">Uso en GPs</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No hay preguntas registradas
              </TableCell>
            </TableRow>
          ) : (
            questions.map((question) => (
              <TableRow key={question.id}>
                <TableCell className="font-medium">
                  {question.text}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`${categoryColors[question.category]}`}
                  >
                    {categoryLabels[question.category]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`flex items-center gap-1 w-fit ${questionTypeColors[question.type]}`}
                  >
                    {questionTypeIcons[question.type]}
                    <span>{questionTypeLabels[question.type]}</span>
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">
                    {question.defaultPoints} pts
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {question._count?.gpQuestions || 0}
                </TableCell>
                <TableCell>
                  <QuestionsActionsClient question={question} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}