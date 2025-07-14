import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { WorkspaceRole } from '@prisma/client'
import crypto from 'crypto'
import { sendWorkspaceInvitationEmail, generateInvitationAcceptUrl } from './email-service'

// Esquemas de validación
export const createInvitationSchema = z.object({
  email: z.string().email("Email inválido"),
  workspaceId: z.string().min(1, "ID de workspace requerido"),
  role: z.nativeEnum(WorkspaceRole).default(WorkspaceRole.member),
  invitedById: z.string().min(1, "ID del invitador requerido"),
  expiresInDays: z.number().min(1).max(30).default(7)
})

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, "Token requerido"),
  userId: z.string().min(1, "ID de usuario requerido")
})

export const resendInvitationSchema = z.object({
  invitationId: z.string().min(1, "ID de invitación requerido"),
  invitedById: z.string().min(1, "ID del invitador requerido")
})

// Tipos
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>
export type ResendInvitationInput = z.infer<typeof resendInvitationSchema>

/**
 * Crea una nueva invitación para unirse a un workspace
 */
export async function createWorkspaceInvitation(input: CreateInvitationInput) {
  try {
    const validatedInput = createInvitationSchema.parse(input)
    
    // Verificar que el workspace existe
    const workspace = await prisma.workspace.findUnique({
      where: { id: validatedInput.workspaceId }
    })
    
    if (!workspace) {
      return { success: false, error: 'Workspace no encontrado' }
    }
    
    // Verificar que el invitador es admin del workspace o superadmin
    const inviter = await prisma.user.findUnique({
      where: { id: validatedInput.invitedById },
      include: {
        workspaces: {
          where: { workspaceId: validatedInput.workspaceId }
        }
      }
    })
    
    if (!inviter) {
      return { success: false, error: 'Usuario invitador no encontrado' }
    }
    
    // Si es superadmin, puede enviar invitaciones a cualquier workspace
    const isSuperadmin = inviter.role === 'superadmin'
    const isWorkspaceAdmin = inviter.workspaces.length > 0 && inviter.workspaces[0].role === WorkspaceRole.admin
    
    if (!isSuperadmin && !isWorkspaceAdmin) {
      return { success: false, error: 'Solo los administradores pueden enviar invitaciones' }
    }
    
    // Verificar si el usuario ya está en el workspace
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedInput.email },
      include: {
        workspaces: {
          where: { workspaceId: validatedInput.workspaceId }
        }
      }
    })
    
    if (existingUser && existingUser.workspaces.length > 0) {
      return { success: false, error: 'El usuario ya pertenece a este workspace' }
    }
    
    // Verificar si ya existe una invitación pendiente
    const existingInvitation = await prisma.workspaceInvitation.findFirst({
      where: {
        email: validatedInput.email,
        workspaceId: validatedInput.workspaceId,
        acceptedAt: null,
        expiresAt: {
          gt: new Date()
        }
      }
    })
    
    if (existingInvitation) {
      return { success: false, error: 'Ya existe una invitación pendiente para este email' }
    }
    
    // Generar token único
    const token = crypto.randomBytes(32).toString('hex')
    
    // Calcular fecha de expiración
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + validatedInput.expiresInDays)
    
    // Crear invitación
    const invitation = await prisma.workspaceInvitation.create({
      data: {
        email: validatedInput.email,
        workspaceId: validatedInput.workspaceId,
        role: validatedInput.role,
        token,
        expiresAt,
        invitedById: validatedInput.invitedById
      },
      include: {
        workspace: true,
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    // Enviar email de invitación
    const acceptUrl = generateInvitationAcceptUrl(token)
    const emailResult = await sendWorkspaceInvitationEmail({
      to: validatedInput.email,
      inviterName: invitation.invitedBy.name || invitation.invitedBy.email,
      workspaceName: invitation.workspace.name,
      acceptUrl,
      expiresInDays: validatedInput.expiresInDays
    })
    
    if (!emailResult.success) {
      // Si el email falla, eliminar la invitación creada
      await prisma.workspaceInvitation.delete({
        where: { id: invitation.id }
      })
      
      return { 
        success: false, 
        error: `Invitación creada pero falló el envío del email: ${emailResult.error}` 
      }
    }
    
    return { 
      success: true, 
      data: { 
        invitation, 
        emailSent: true,
        emailId: emailResult.data?.emailId 
      } 
    }
    
  } catch (error: unknown) {
    console.error('Error creating workspace invitation:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al crear la invitación' 
    }
  }
}

/**
 * Acepta una invitación y agrega el usuario al workspace
 */
export async function acceptWorkspaceInvitation(input: AcceptInvitationInput) {
  try {
    const validatedInput = acceptInvitationSchema.parse(input)
    
    // Buscar invitación
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token: validatedInput.token },
      include: {
        workspace: true,
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    if (!invitation) {
      return { success: false, error: 'Invitación no encontrada' }
    }
    
    // Verificar que no esté expirada
    if (invitation.expiresAt < new Date()) {
      return { success: false, error: 'La invitación ha expirado' }
    }
    
    // Verificar que no esté ya aceptada
    if (invitation.acceptedAt) {
      return { success: false, error: 'Esta invitación ya ha sido aceptada' }
    }
    
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: validatedInput.userId }
    })
    
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' }
    }
    
    // Verificar que el email coincide
    if (user.email !== invitation.email) {
      return { success: false, error: 'El email no coincide con la invitación' }
    }
    
    // Verificar que el usuario no esté ya en el workspace
    const existingMembership = await prisma.workspaceUser.findUnique({
      where: {
        userId_workspaceId: {
          userId: validatedInput.userId,
          workspaceId: invitation.workspaceId
        }
      }
    })
    
    if (existingMembership) {
      return { success: false, error: 'Ya eres miembro de este workspace' }
    }
    
    // Usar transacción para aceptar invitación y agregar usuario
    const result = await prisma.$transaction(async (tx) => {
      // Marcar invitación como aceptada
      const acceptedInvitation = await tx.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { acceptedAt: new Date() },
        include: {
          workspace: true,
          invitedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
      
      // Agregar usuario al workspace
      const workspaceUser = await tx.workspaceUser.create({
        data: {
          userId: validatedInput.userId,
          workspaceId: invitation.workspaceId,
          role: invitation.role
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          workspace: true
        }
      })
      
      return { invitation: acceptedInvitation, workspaceUser }
    })
    
    return { success: true, data: result }
    
  } catch (error: unknown) {
    console.error('Error accepting workspace invitation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al aceptar la invitación'
    }
  }
}

/**
 * Obtiene invitaciones pendientes de un workspace
 */
export async function getWorkspaceInvitations(workspaceId: string) {
  try {
    const invitations = await prisma.workspaceInvitation.findMany({
      where: {
        workspaceId,
        acceptedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return invitations
    
  } catch (error) {
    console.error('Error getting workspace invitations:', error)
    throw new Error('Error al obtener las invitaciones')
  }
}

/**
 * Obtiene invitaciones pendientes de un usuario por email
 */
export async function getUserPendingInvitations(email: string) {
  try {
    const invitations = await prisma.workspaceInvitation.findMany({
      where: {
        email,
        acceptedAt: null,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        workspace: true,
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return invitations
    
  } catch (error) {
    console.error('Error getting user pending invitations:', error)
    throw new Error('Error al obtener las invitaciones pendientes')
  }
}

/**
 * Cancela una invitación pendiente
 */
export async function cancelWorkspaceInvitation(invitationId: string, userId: string) {
  try {
    // Verificar que la invitación existe
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { id: invitationId },
      include: {
        workspace: true
      }
    })
    
    if (!invitation) {
      throw new Error('Invitación no encontrada')
    }
    
    // Obtener información del usuario que quiere cancelar
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workspaces: {
          where: { 
            workspaceId: invitation.workspaceId,
            role: WorkspaceRole.admin
          }
        }
      }
    })
    
    if (!user) {
      throw new Error('Usuario no encontrado')
    }
    
    // Verificar permisos: superadmin, admin del workspace, o quien envió la invitación
    const isSuperadmin = user.role === 'superadmin'
    const isWorkspaceAdmin = user.workspaces.length > 0
    const isInviter = invitation.invitedById === userId
    
    if (!isSuperadmin && !isWorkspaceAdmin && !isInviter) {
      return { success: false, error: 'No tienes permisos para cancelar esta invitación' }
    }
    
    // Eliminar invitación
    await prisma.workspaceInvitation.delete({
      where: { id: invitationId }
    })
    
    return { success: true }
    
  } catch (error: unknown) {
    console.error('Error canceling workspace invitation:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al cancelar la invitación' 
    }
  }
}

/**
 * Reenvía una invitación (genera nuevo token y extiende fecha)
 */
export async function resendWorkspaceInvitation(input: ResendInvitationInput) {
  const validatedInput = resendInvitationSchema.parse(input)
  
  try {
    // Verificar que la invitación existe
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { id: validatedInput.invitationId },
      include: {
        workspace: true
      }
    })
    
    if (!invitation) {
      throw new Error('Invitación no encontrada')
    }
    
    // Obtener información del usuario que quiere reenviar
    const user = await prisma.user.findUnique({
      where: { id: validatedInput.invitedById },
      include: {
        workspaces: {
          where: { 
            workspaceId: invitation.workspaceId,
            role: WorkspaceRole.admin
          }
        }
      }
    })
    
    if (!user) {
      throw new Error('Usuario no encontrado')
    }
    
    // Verificar permisos: superadmin o admin del workspace
    const isSuperadmin = user.role === 'superadmin'
    const isWorkspaceAdmin = user.workspaces.length > 0
    
    if (!isSuperadmin && !isWorkspaceAdmin) {
      throw new Error('Solo los administradores pueden reenviar invitaciones')
    }
    
    // Verificar que no esté aceptada
    if (invitation.acceptedAt) {
      throw new Error('No se puede reenviar una invitación ya aceptada')
    }
    
    // Generar nuevo token y extender fecha
    const newToken = crypto.randomBytes(32).toString('hex')
    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + 7) // 7 días más
    
    const updatedInvitation = await prisma.workspaceInvitation.update({
      where: { id: validatedInput.invitationId },
      data: {
        token: newToken,
        expiresAt: newExpiresAt
      },
      include: {
        workspace: true,
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    // Enviar email de invitación con el nuevo token
    const acceptUrl = generateInvitationAcceptUrl(newToken)
    const emailResult = await sendWorkspaceInvitationEmail({
      to: invitation.email,
      inviterName: updatedInvitation.invitedBy.name || updatedInvitation.invitedBy.email,
      workspaceName: updatedInvitation.workspace.name,
      acceptUrl,
      expiresInDays: 7
    })
    
    if (!emailResult.success) {
      return { 
        success: false, 
        error: `Invitación actualizada pero falló el reenvío del email: ${emailResult.error}` 
      }
    }
    
    return { 
      success: true, 
      data: { 
        invitation: updatedInvitation, 
        emailSent: true,
        emailId: emailResult.data?.emailId 
      } 
    }
    
  } catch (error: unknown) {
    console.error('Error resending workspace invitation:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error al reenviar la invitación' 
    }
  }
}

/**
 * Obtiene una invitación por token
 */
export async function getInvitationByToken(token: string) {
  try {
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
      include: {
        workspace: true,
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })
    
    return invitation
    
  } catch (error) {
    console.error('Error getting invitation by token:', error)
    throw new Error('Error al obtener la invitación')
  }
}