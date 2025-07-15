import { QuestionCategory } from '@prisma/client'

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  CLASSIC: 'Preguntas Clásicas',
  PILOT_FOCUS: 'Piloto en el Foco',
  STROLLOMETER: 'Strollómetro',
}

export const CATEGORY_COLORS: Record<QuestionCategory, string> = {
  CLASSIC: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  PILOT_FOCUS: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  STROLLOMETER: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
}

export const CATEGORY_DESCRIPTIONS: Record<QuestionCategory, string> = {
  CLASSIC: 'Las preguntas de siempre sobre la carrera',
  PILOT_FOCUS: 'Preguntas especiales sobre el piloto destacado',
  STROLLOMETER: 'El medidor de rendimiento de Lance Stroll',
}