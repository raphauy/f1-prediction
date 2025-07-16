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
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[35%]">Plantilla</TableHead>
            <TableHead className="w-[10%] px-2">Categoría</TableHead>
            <TableHead className="w-[10%] px-2">Tipo</TableHead>
            <TableHead className="w-[12%] px-2">Badge</TableHead>
            <TableHead className="w-[10%] text-center px-2">Puntos</TableHead>
            <TableHead className="w-[8%] text-center px-2">Usos</TableHead>
            <TableHead className="w-[5%]"></TableHead>
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
                <TableCell className="font-medium py-2">
                  <div>
                    <p className="line-clamp-1">{template.text}</p>
                    {template.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{template.description}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-2 py-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${categoryColors[template.category]}`}
                  >
                    {categoryLabels[template.category]}
                  </Badge>
                </TableCell>
                <TableCell className="px-2 py-2">
                  <Badge 
                    variant="outline" 
                    className={`inline-flex items-center gap-1 text-xs ${questionTypeColors[template.type]}`}
                  >
                    {questionTypeIcons[template.type]}
                    <span className="hidden xl:inline">{questionTypeLabels[template.type]}</span>
                  </Badge>
                </TableCell>
                <TableCell className="px-2 py-2">
                  {template.badge && QUESTION_BADGES[template.badge as keyof typeof QUESTION_BADGES] ? (() => {
                    const badgeData = QUESTION_BADGES[template.badge as keyof typeof QUESTION_BADGES]
                    const Icon = badgeData.icon
                    return (
                      <Badge className={`inline-flex items-center gap-1 text-xs ${badgeData.color}`}>
                        <Icon className="h-3 w-3" />
                        <span className="hidden xl:inline">{badgeData.label}</span>
                      </Badge>
                    )
                  })() : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center px-2 py-2">
                  <Badge variant="secondary" className="text-xs">
                    {template.defaultPoints} pts
                  </Badge>
                </TableCell>
                <TableCell className="text-center px-2 py-2 text-sm">
                  {template._count?.gpQuestions || 0}
                </TableCell>
                <TableCell className="py-2">
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