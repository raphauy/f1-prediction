import { getAllUsers } from "@/services/user-service"
import { getAllWorkspaces } from "@/services/workspace-service"
import { getAllSeasons } from "@/services/season-service"
import { getAllGrandPrix } from "@/services/grand-prix-service"
import { getAllQuestionTemplates } from "@/services/question-template-service"
import { AdminSidebarClient } from "./admin-sidebar-client"

interface AdminSidebarProps {
  children: React.ReactNode
}

export async function AdminSidebar({ children }: AdminSidebarProps) {
  const [users, workspaces, seasons, grandPrix, templates] = await Promise.all([
    getAllUsers(),
    getAllWorkspaces(),
    getAllSeasons(),
    getAllGrandPrix(),
    getAllQuestionTemplates()
  ])
  
  const userCount = users.length
  const workspaceCount = workspaces.length
  const seasonCount = seasons.length
  const grandPrixCount = grandPrix.length
  const templateCount = templates.length

  return (
    <AdminSidebarClient 
      userCount={userCount} 
      workspaceCount={workspaceCount}
      seasonCount={seasonCount}
      grandPrixCount={grandPrixCount}
      templateCount={templateCount}
    >
      {children}
    </AdminSidebarClient>
  )
}