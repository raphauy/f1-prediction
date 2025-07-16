import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import GPLaunchedEmail from '@/components/emails/gp-launched-email'
import GPReminderEmail from '@/components/emails/gp-reminder-email'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { createActivity } from './activity-service'

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Schemas de validación
export const sendGPLaunchedNotificationSchema = z.object({
  grandPrixId: z.string().cuid(),
  sentByUserId: z.string().cuid()
})

export const sendGPReminderSchema = z.object({
  grandPrixId: z.string().cuid(),
  sentByUserId: z.string().cuid(),
  customMessage: z.string().optional()
})

// Tipos
export type SendGPLaunchedNotificationInput = z.infer<typeof sendGPLaunchedNotificationSchema>
export type SendGPReminderInput = z.infer<typeof sendGPReminderSchema>

/**
 * Obtiene los usuarios que deben ser notificados para un GP
 */
async function getUsersToNotify(grandPrixId: string) {
  // Obtener el GP con su temporada
  const grandPrix = await prisma.grandPrix.findUnique({
    where: { id: grandPrixId },
    include: {
      season: true
    }
  })

  if (!grandPrix) {
    throw new Error('Grand Prix no encontrado')
  }

  // Obtener todos los workspaces que tienen esta temporada activa
  const activeWorkspaceSeasons = await prisma.workspaceSeason.findMany({
    where: {
      seasonId: grandPrix.seasonId,
      isActive: true
    },
    include: {
      workspace: {
        include: {
          users: {
            include: {
              user: true
            }
          }
        }
      }
    }
  })

  // Extraer usuarios únicos con notificaciones habilitadas
  const uniqueUsers = new Map()
  
  for (const ws of activeWorkspaceSeasons) {
    for (const workspaceUser of ws.workspace.users) {
      const user = workspaceUser.user
      // Solo agregar usuarios con notificaciones habilitadas y que no estén ya en el map
      if (user.notifyGPLaunched && !uniqueUsers.has(user.id)) {
        uniqueUsers.set(user.id, {
          ...user,
          workspaceName: ws.workspace.name,
          workspaceSlug: ws.workspace.slug
        })
      }
    }
  }

  return Array.from(uniqueUsers.values())
}

/**
 * Envía notificaciones de lanzamiento de GP a todos los usuarios
 */
export async function sendGPLaunchedNotifications(input: SendGPLaunchedNotificationInput) {
  const validated = sendGPLaunchedNotificationSchema.parse(input)
  
  // Obtener el GP con toda la información necesaria
  const grandPrix = await prisma.grandPrix.findUnique({
    where: { id: validated.grandPrixId },
    include: {
      season: true
    }
  })

  if (!grandPrix) {
    throw new Error('Grand Prix no encontrado')
  }

  if (grandPrix.status !== 'ACTIVE') {
    throw new Error('El Grand Prix debe estar activo para enviar notificaciones')
  }

  if (grandPrix.notificationsSent) {
    throw new Error('Ya se enviaron notificaciones para este Grand Prix')
  }

  // Obtener usuarios a notificar
  const usersToNotify = await getUsersToNotify(grandPrix.id)
  
  if (usersToNotify.length === 0) {
    return {
      success: true,
      message: 'No hay usuarios para notificar',
      sentCount: 0
    }
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "notifications@raphauy.dev"
  let sentCount = 0
  const errors: Array<{ email: string; error: string }> = []

  // Enviar emails secuencialmente
  for (const user of usersToNotify) {
    try {
      const predictUrl = `${process.env.NEXTAUTH_URL}/w/${user.workspaceSlug}/predict/${grandPrix.id}`
      
      await resend.emails.send({
        from: `Paddock Masters <${fromEmail}>`,
        to: [user.email],
        subject: `¡Nuevo GP disponible! ${grandPrix.name} - Paddock Masters`,
        react: GPLaunchedEmail({
          userEmail: user.email,
          userName: user.name || 'Competidor',
          grandPrixName: grandPrix.name,
          location: grandPrix.location,
          country: grandPrix.country,
          circuit: grandPrix.circuit,
          raceDate: grandPrix.raceDate,
          qualifyingDate: grandPrix.qualifyingDate,
          predictUrl,
          workspaceName: user.workspaceName
        })
      })
      
      sentCount++
    } catch (error) {
      console.error(`Error enviando email a ${user.email}:`, error)
      errors.push({ email: user.email, error: error instanceof Error ? error.message : 'Error desconocido' })
    }
  }

  // Marcar las notificaciones como enviadas
  await prisma.grandPrix.update({
    where: { id: grandPrix.id },
    data: { notificationsSent: true }
  })

  // Registrar en el log de actividad de cada workspace
  const workspaceIds = new Set(
    usersToNotify.map(u => u.workspaceId).filter(Boolean)
  )
  
  for (const workspaceId of workspaceIds) {
    if (workspaceId) {
      await createActivity({
        workspaceId,
        userId: validated.sentByUserId,
        type: 'gp_launched',
        description: `GP "${grandPrix.name}" lanzado y notificaciones enviadas`,
        metadata: {
          grandPrixId: grandPrix.id,
          grandPrixName: grandPrix.name,
          notificationsSent: sentCount
        }
      })
    }
  }

  return {
    success: true,
    message: `Notificaciones enviadas exitosamente`,
    sentCount,
    totalUsers: usersToNotify.length,
    errors: errors.length > 0 ? errors : undefined
  }
}

/**
 * Envía recordatorios de GP a usuarios
 */
export async function sendGPReminders(input: SendGPReminderInput) {
  const validated = sendGPReminderSchema.parse(input)
  
  // Obtener el GP con información de predicciones
  const grandPrix = await prisma.grandPrix.findUnique({
    where: { id: validated.grandPrixId },
    include: {
      season: true,
      predictions: {
        select: {
          userId: true
        },
        distinct: ['userId']
      }
    }
  })

  if (!grandPrix) {
    throw new Error('Grand Prix no encontrado')
  }

  if (grandPrix.status !== 'ACTIVE') {
    throw new Error('El Grand Prix debe estar activo para enviar recordatorios')
  }

  const now = new Date()
  if (now >= grandPrix.qualifyingDate) {
    throw new Error('Las predicciones ya están cerradas para este GP')
  }

  // Obtener usuarios a notificar (con preferencia de recordatorios habilitada)
  const allUsers = await getUsersToNotifyForReminders(grandPrix.id)
  
  // Crear un set de usuarios que ya han predicho
  const userIdsWithPredictions = new Set(grandPrix.predictions.map(p => p.userId))
  
  // Separar usuarios en dos grupos
  const usersWithPredictions = allUsers.filter(u => userIdsWithPredictions.has(u.id))
  const usersWithoutPredictions = allUsers.filter(u => !userIdsWithPredictions.has(u.id))

  const fromEmail = process.env.RESEND_FROM_EMAIL || "notifications@raphauy.dev"
  let sentCount = 0
  const errors: Array<{ email: string; error: string }> = []

  // Calcular tiempo restante
  const timeRemaining = formatDistanceToNow(grandPrix.qualifyingDate, { 
    locale: es,
    addSuffix: false 
  })

  // Enviar emails secuencialmente
  const sendToUser = async (user: { id: string; email: string; name?: string | null; workspaceName: string; workspaceSlug: string; workspaceId: string }, hasPredicted: boolean) => {
    try {
      const predictUrl = `${process.env.NEXTAUTH_URL}/w/${user.workspaceSlug}/predict/${grandPrix.id}`
      
      await resend.emails.send({
        from: `Paddock Masters <${fromEmail}>`,
        to: [user.email],
        subject: `⏰ Recordatorio: ${timeRemaining} para cerrar predicciones - ${grandPrix.name}`,
        react: GPReminderEmail({
          userEmail: user.email,
          userName: user.name || 'Competidor',
          grandPrixName: grandPrix.name,
          location: grandPrix.location,
          qualifyingDate: grandPrix.qualifyingDate,
          predictUrl,
          workspaceName: user.workspaceName,
          hasUserPredicted: hasPredicted,
          timeRemaining
        })
      })
      
      sentCount++
    } catch (error) {
      console.error(`Error enviando recordatorio a ${user.email}:`, error)
      errors.push({ email: user.email, error: error instanceof Error ? error.message : 'Error desconocido' })
    }
  }

  // Enviar a usuarios sin predicciones primero (más urgente)
  for (const user of usersWithoutPredictions) {
    await sendToUser(user, false)
  }

  // Luego a usuarios con predicciones
  for (const user of usersWithPredictions) {
    await sendToUser(user, true)
  }

  // Registrar en el log de actividad
  const workspaceIds = new Set(
    allUsers.map(u => u.workspaceId).filter(Boolean)
  )
  
  for (const workspaceId of workspaceIds) {
    if (workspaceId) {
      await createActivity({
        workspaceId,
        userId: validated.sentByUserId,
        type: 'reminder_sent',
        description: validated.customMessage || 
          `Recordatorio enviado: quedan ${timeRemaining} para cerrar predicciones del ${grandPrix.name}`,
        metadata: {
          grandPrixId: grandPrix.id,
          grandPrixName: grandPrix.name,
          remindersSent: sentCount,
          timeRemaining,
          usersWithoutPredictions: usersWithoutPredictions.length,
          usersWithPredictions: usersWithPredictions.length
        }
      })
    }
  }

  return {
    success: true,
    message: `Recordatorios enviados exitosamente`,
    sentCount,
    totalUsers: allUsers.length,
    usersWithoutPredictions: usersWithoutPredictions.length,
    usersWithPredictions: usersWithPredictions.length,
    timeRemaining,
    errors: errors.length > 0 ? errors : undefined
  }
}

/**
 * Obtiene usuarios con preferencia de recordatorios habilitada
 */
async function getUsersToNotifyForReminders(grandPrixId: string) {
  const grandPrix = await prisma.grandPrix.findUnique({
    where: { id: grandPrixId },
    include: {
      season: true
    }
  })

  if (!grandPrix) {
    throw new Error('Grand Prix no encontrado')
  }

  const activeWorkspaceSeasons = await prisma.workspaceSeason.findMany({
    where: {
      seasonId: grandPrix.seasonId,
      isActive: true
    },
    include: {
      workspace: {
        include: {
          users: {
            include: {
              user: true
            }
          }
        }
      }
    }
  })

  const uniqueUsers = new Map()
  
  for (const ws of activeWorkspaceSeasons) {
    for (const workspaceUser of ws.workspace.users) {
      const user = workspaceUser.user
      // Solo usuarios con recordatorios habilitados
      if (user.notifyReminders && !uniqueUsers.has(user.id)) {
        uniqueUsers.set(user.id, {
          ...user,
          workspaceName: ws.workspace.name,
          workspaceSlug: ws.workspace.slug,
          workspaceId: ws.workspace.id
        })
      }
    }
  }

  return Array.from(uniqueUsers.values())
}

interface GPPreviewData {
  id: string
  name: string
  location: string
  country: string
  circuit: string
  raceDate: Date
  qualifyingDate: Date
}

interface WorkspacePreviewData {
  name: string
  slug: string
}

/**
 * Genera el contenido del email de lanzamiento para preview
 */
export function generateGPLaunchedEmailPreview(grandPrix: GPPreviewData, workspace: WorkspacePreviewData) {
  return {
    subject: `¡Nuevo GP disponible! ${grandPrix.name} - Paddock Masters`,
    preview: GPLaunchedEmail({
      userEmail: "usuario@ejemplo.com",
      userName: "Nombre del Usuario",
      grandPrixName: grandPrix.name,
      location: grandPrix.location,
      country: grandPrix.country,
      circuit: grandPrix.circuit,
      raceDate: grandPrix.raceDate,
      qualifyingDate: grandPrix.qualifyingDate,
      predictUrl: `${process.env.NEXTAUTH_URL}/w/${workspace.slug}/predictions/${grandPrix.id}`,
      workspaceName: workspace.name
    })
  }
}

/**
 * Genera el contenido del email de recordatorio para preview
 */
export function generateGPReminderEmailPreview(grandPrix: GPPreviewData, workspace: WorkspacePreviewData, hasUserPredicted = false) {
  const timeRemaining = formatDistanceToNow(grandPrix.qualifyingDate, { 
    locale: es,
    addSuffix: false 
  })
  
  return {
    subject: `⏰ Recordatorio: ${timeRemaining} para cerrar predicciones - ${grandPrix.name}`,
    preview: GPReminderEmail({
      userEmail: "usuario@ejemplo.com",
      userName: "Nombre del Usuario",
      grandPrixName: grandPrix.name,
      location: grandPrix.location,
      qualifyingDate: grandPrix.qualifyingDate,
      predictUrl: `${process.env.NEXTAUTH_URL}/w/${workspace.slug}/predict/${grandPrix.id}`,
      workspaceName: workspace.name,
      hasUserPredicted,
      timeRemaining
    })
  }
}