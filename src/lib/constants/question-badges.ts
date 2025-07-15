import { Trophy, Medal, Zap, Timer, Target, XCircle, Star, TrendingUp, TrendingDown, Users, Gauge, Package, AlertTriangle, Shield, AlertCircle } from 'lucide-react'

export const QUESTION_BADGES = {
  // Badges para preguntas de pilotos
  WINNER: { 
    label: 'Ganador', 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    icon: Trophy
  },
  PODIUM: { 
    label: 'Podio', 
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    icon: Medal
  },
  POLE_POSITION: { 
    label: 'Pole', 
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    icon: Zap
  },
  FASTEST_LAP: { 
    label: 'Vuelta Rápida', 
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: Timer
  },
  POINTS_FINISH: { 
    label: 'Puntos', 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: Target
  },
  DNF: { 
    label: 'DNF', 
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: XCircle
  },
  DRIVER_OF_THE_DAY: {
    label: 'Driver of the Day',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    icon: Star
  },
  POSITION_GAIN: {
    label: 'Gana Posiciones',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    icon: TrendingUp
  },
  POSITION_LOSS: {
    label: 'Pierde Posiciones',
    color: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
    icon: TrendingDown
  },
  // Badges para preguntas de equipos
  TEAM_WINNER: {
    label: 'Equipo Ganador',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    icon: Users
  },
  FASTEST_PIT_STOP: {
    label: 'Pit Stop Más Rápido',
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    icon: Gauge
  },
  TEAM_POINTS: {
    label: 'Más Puntos',
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    icon: Package
  },
  // Badges generales
  SAFETY_CAR: {
    label: 'Safety Car',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    icon: AlertTriangle
  },
  PENALTY: {
    label: 'Penalización',
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    icon: Shield
  },
  INCIDENT: {
    label: 'Incidente',
    color: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200',
    icon: AlertCircle
  }
} as const

export type QuestionBadge = keyof typeof QUESTION_BADGES

// Helper para obtener los badges válidos según el tipo de pregunta
export function getBadgesForType(type: string): QuestionBadge[] {
  switch (type) {
    case 'DRIVERS':
      return [
        'WINNER', 
        'PODIUM', 
        'POLE_POSITION', 
        'FASTEST_LAP', 
        'POINTS_FINISH', 
        'DNF',
        'DRIVER_OF_THE_DAY',
        'POSITION_GAIN',
        'POSITION_LOSS'
      ]
    case 'TEAMS':
      return [
        'TEAM_WINNER',
        'FASTEST_PIT_STOP',
        'TEAM_POINTS'
      ]
    case 'BOOLEAN':
      return [
        'SAFETY_CAR',
        'PENALTY',
        'INCIDENT',
        'DNF'
      ]
    case 'NUMERIC':
      return [
        'DNF',
        'SAFETY_CAR',
        'PENALTY',
        'INCIDENT'
      ]
    case 'HEAD_TO_HEAD':
      return [
        'POSITION_GAIN',
        'POSITION_LOSS',
        'POINTS_FINISH'
      ]
    case 'MULTIPLE_CHOICE':
      return [
        'SAFETY_CAR',
        'PENALTY',
        'INCIDENT'
      ]
    default:
      return []
  }
}