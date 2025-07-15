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
import { QuestionTemplatesActionsClient } from './question-templates-actions-client'
import type { QuestionTemplate, QuestionType, QuestionCategory } from '@prisma/client'
import { Flag, Users, HelpCircle, Hash, Binary, GitCompare } from 'lucide-react'
import { QUESTION_BADGES } from '@/lib/constants/question-badges'

interface QuestionTemplatesTableClientProps {
  templates: (QuestionTemplate & {
    _count?: {
      gpQuestions?: number
    }
  })[]
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
  DRIVERS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  TEAMS: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  MULTIPLE_CHOICE: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  NUMERIC: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  BOOLEAN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  HEAD_TO_HEAD: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
}

export function QuestionTemplatesTableClient({ templates }: QuestionTemplatesTableClientProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plantilla</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Badge</TableHead>
            <TableHead className="text-center">Puntos por defecto</TableHead>
            <TableHead className="text-center">Veces usada</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No hay plantillas registradas
              </TableCell>
            </TableRow>
          ) : (
            templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">
                  <div>
                    <p>{template.text}</p>
                    {template.description && (
                      <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`${categoryColors[template.category]}`}
                  >
                    {categoryLabels[template.category]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`flex items-center gap-1 w-fit ${questionTypeColors[template.type]}`}
                  >
                    {questionTypeIcons[template.type]}
                    <span>{questionTypeLabels[template.type]}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  {template.badge && QUESTION_BADGES[template.badge as keyof typeof QUESTION_BADGES] ? (() => {
                    const badgeData = QUESTION_BADGES[template.badge as keyof typeof QUESTION_BADGES]
                    const Icon = badgeData.icon
                    return (
                      <Badge className={`flex items-center gap-1 w-fit ${badgeData.color}`}>
                        <Icon className="h-3 w-3" />
                        <span>{badgeData.label}</span>
                      </Badge>
                    )
                  })() : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">
                    {template.defaultPoints} pts
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  {template._count?.gpQuestions || 0}
                </TableCell>
                <TableCell>
                  <QuestionTemplatesActionsClient template={template} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}