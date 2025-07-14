import { getAllUsers } from "@/services/user-service"
import { getAllWorkspaces } from "@/services/workspace-service"
import { getAllSeasons } from "@/services/season-service"
import { AdminSidebarClient } from "./admin-sidebar-client"

interface AdminSidebarProps {
  children: React.ReactNode
}

export async function AdminSidebar({ children }: AdminSidebarProps) {
  const [users, workspaces, seasons] = await Promise.all([
    getAllUsers(),
    getAllWorkspaces(),
    getAllSeasons()
  ])
  
  const userCount = users.length
  const workspaceCount = workspaces.length
  const seasonCount = seasons.length

  return (
    <AdminSidebarClient 
      userCount={userCount} 
      workspaceCount={workspaceCount}
      seasonCount={seasonCount}
    >
      {children}
    </AdminSidebarClient>
  )
}