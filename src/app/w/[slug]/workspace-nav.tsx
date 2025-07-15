import { WorkspaceNavClient } from "./workspace-nav-client"
import type { Workspace } from "@prisma/client"

interface WorkspaceNavProps {
  workspaceSlug: string
  isAdmin: boolean
  user: {
    id: string
    name: string | null
    email: string
    role: string
    image?: string | null
  }
  userWorkspaces?: {
    workspace: Workspace
  }[]
  currentWorkspace?: Workspace
}

export function WorkspaceNav(props: WorkspaceNavProps) {
  return <WorkspaceNavClient {...props} />
}