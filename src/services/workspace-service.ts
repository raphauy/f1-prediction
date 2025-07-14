import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { Workspace, WorkspaceUser, WorkspaceRole, type User } from "@prisma/client"

// ✅ Validaciones al inicio del archivo
export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  slug: z.string()
    .min(1, "Slug requerido")
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().optional()
})

export const updateWorkspaceSchema = createWorkspaceSchema.partial()

// Tipos derivados de schemas
export type CreateWorkspaceData = z.infer<typeof createWorkspaceSchema>
export type UpdateWorkspaceData = z.infer<typeof updateWorkspaceSchema>

// Tipos extendidos para queries
export type WorkspaceWithUsers = Workspace & {
  users: (WorkspaceUser & {
    user: User
  })[]
  _count: {
    users: number
  }
}

/**
 * Obtiene un workspace por ID con usuarios
 */
export async function getWorkspaceById(id: string): Promise<WorkspaceWithUsers | null> {
  return await prisma.workspace.findUnique({
    where: { id },
    include: {
      users: {
        include: {
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          users: true
        }
      }
    }
  })
}

/**
 * Obtiene un workspace por slug
 */
export async function getWorkspaceBySlug(slug: string): Promise<Workspace | null> {
  return await prisma.workspace.findUnique({
    where: { slug }
  })
}

/**
 * Obtiene todos los workspaces
 */
export async function getAllWorkspaces(): Promise<WorkspaceWithUsers[]> {
  return await prisma.workspace.findMany({
    include: {
      users: {
        include: {
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          users: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Obtiene los workspaces de un usuario
 * Si es superadmin, devuelve todos los workspaces
 */
export async function getUserWorkspaces(userId: string): Promise<(WorkspaceUser & { workspace: Workspace })[]> {
  // Verificar si el usuario es superadmin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })

  if (user?.role === "superadmin") {
    // Superadmin tiene acceso a todos los workspaces
    const allWorkspaces = await prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    // Convertir a formato compatible con WorkspaceUser
    return allWorkspaces.map(workspace => ({
      id: `superadmin-${workspace.id}`,
      userId,
      workspaceId: workspace.id,
      role: WorkspaceRole.admin, // Superadmin siempre es admin
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      workspace
    }))
  }

  return await prisma.workspaceUser.findMany({
    where: { userId },
    include: {
      workspace: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

/**
 * Obtiene los usuarios de un workspace
 */
export async function getWorkspaceUsers(workspaceId: string): Promise<(WorkspaceUser & { user: User })[]> {
  return await prisma.workspaceUser.findMany({
    where: { workspaceId },
    include: {
      user: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

/**
 * Crea un nuevo workspace
 */
export async function createWorkspace(data: CreateWorkspaceData): Promise<Workspace> {
  const validated = createWorkspaceSchema.parse(data)
  
  return await prisma.workspace.create({
    data: validated
  })
}

/**
 * Actualiza un workspace existente
 */
export async function updateWorkspace(id: string, data: UpdateWorkspaceData): Promise<Workspace> {
  const validated = updateWorkspaceSchema.parse(data)
  
  return await prisma.workspace.update({
    where: { id },
    data: validated
  })
}

/**
 * Elimina un workspace
 */
export async function deleteWorkspace(id: string): Promise<Workspace> {
  return await prisma.workspace.delete({
    where: { id }
  })
}

/**
 * Agrega un usuario a un workspace
 */
export async function addUserToWorkspace(
  userId: string,
  workspaceId: string,
  role: WorkspaceRole = WorkspaceRole.member
): Promise<WorkspaceUser> {
  return await prisma.workspaceUser.create({
    data: {
      userId,
      workspaceId,
      role
    }
  })
}

/**
 * Remueve un usuario de un workspace
 */
export async function removeUserFromWorkspace(userId: string, workspaceId: string): Promise<WorkspaceUser> {
  return await prisma.workspaceUser.delete({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId
      }
    }
  })
}

/**
 * Actualiza el rol de un usuario en un workspace
 */
export async function updateUserWorkspaceRole(
  userId: string,
  workspaceId: string,
  role: WorkspaceRole
): Promise<WorkspaceUser> {
  return await prisma.workspaceUser.update({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId
      }
    },
    data: { role }
  })
}

/**
 * Verifica si un usuario pertenece a un workspace
 * Superadmins siempre tienen acceso
 */
export async function isUserInWorkspace(userId: string, workspaceId: string): Promise<boolean> {
  // Verificar si el usuario es superadmin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })

  if (user?.role === "superadmin") {
    return true // Superadmin siempre tiene acceso
  }

  const workspaceUser = await prisma.workspaceUser.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId
      }
    }
  })
  
  return !!workspaceUser
}

/**
 * Verifica si un usuario es admin de un workspace
 * Superadmins siempre son admin
 */
export async function isUserWorkspaceAdmin(userId: string, workspaceId: string): Promise<boolean> {
  // Verificar si el usuario es superadmin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  })

  if (user?.role === "superadmin") {
    return true // Superadmin siempre es admin de todos los workspaces
  }

  const workspaceUser = await prisma.workspaceUser.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId
      }
    }
  })
  
  return workspaceUser?.role === WorkspaceRole.admin
}