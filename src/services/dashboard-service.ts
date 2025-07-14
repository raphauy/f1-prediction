import { prisma } from "@/lib/prisma"

export interface AdminDashboardMetrics {
  totalUsers: number
  totalWorkspaces: number
  pendingInvitations: number
  activeUsers: number
  adminUsers: number
}

/**
 * Obtiene las métricas para el dashboard de admin
 */
export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  const [
    totalUsers,
    totalWorkspaces,
    pendingInvitations,
    activeUsers,
    adminUsers
  ] = await Promise.all([
    // Total de usuarios
    prisma.user.count(),
    
    // Total de workspaces
    prisma.workspace.count(),
    
    // Invitaciones pendientes (no aceptadas y no expiradas)
    prisma.workspaceInvitation.count({
      where: {
        acceptedAt: null,
        expiresAt: {
          gt: new Date()
        }
      }
    }),
    
    // Usuarios activos (que han completado onboarding)
    prisma.user.count({
      where: {
        isOnboarded: true
      }
    }),
    
    // Usuarios con rol admin (superadmin + workspace admins)
    prisma.user.count({
      where: {
        OR: [
          { role: "superadmin" },
          { 
            workspaces: {
              some: {
                role: "admin"
              }
            }
          }
        ]
      }
    })
  ])

  return {
    totalUsers,
    totalWorkspaces,
    pendingInvitations,
    activeUsers,
    adminUsers
  }
}