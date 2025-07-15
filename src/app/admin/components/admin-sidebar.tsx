import { getAllUsers } from "@/services/user-service"
import { getAllWorkspaces } from "@/services/workspace-service"
import { getAllSeasons } from "@/services/season-service"
import { getAllGrandPrix } from "@/services/grand-prix-service"
import { getAllQuestions } from "@/services/question-service"
import { AdminSidebarClient } from "./admin-sidebar-client"

interface AdminSidebarProps {
  children: React.ReactNode
}

export async function AdminSidebar({ children }: AdminSidebarProps) {
  const [users, workspaces, seasons, grandPrix, questions] = await Promise.all([
    getAllUsers(),
    getAllWorkspaces(),
    getAllSeasons(),
    getAllGrandPrix(),
    getAllQuestions()
  ])
  
  const userCount = users.length
  const workspaceCount = workspaces.length
  const seasonCount = seasons.length
  const grandPrixCount = grandPrix.length
  const questionCount = questions.length

  return (
    <AdminSidebarClient 
      userCount={userCount} 
      workspaceCount={workspaceCount}
      seasonCount={seasonCount}
      grandPrixCount={grandPrixCount}
      questionCount={questionCount}
    >
      {children}
    </AdminSidebarClient>
  )
}