import { getAllUsers } from "@/services/user-service"
import { getAllWorkspaces } from "@/services/workspace-service"
import { AdminSidebarClient } from "./admin-sidebar-client"

interface AdminSidebarProps {
  children: React.ReactNode
}

export async function AdminSidebar({ children }: AdminSidebarProps) {
  const [users, workspaces] = await Promise.all([
    getAllUsers(),
    getAllWorkspaces()
  ])
  
  const userCount = users.length
  const workspaceCount = workspaces.length

  return (
    <AdminSidebarClient 
      userCount={userCount} 
      workspaceCount={workspaceCount}
    >
      {children}
    </AdminSidebarClient>
  )
}