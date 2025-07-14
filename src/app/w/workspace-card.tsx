import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Workspace, WorkspaceRole } from "@prisma/client"
import { Building2, Users, ArrowRight, Shield } from "lucide-react"
import Link from "next/link"

interface WorkspaceCardProps {
  workspace: Workspace
  userRole: WorkspaceRole
  isSuperadmin?: boolean
}

export function WorkspaceCard({ workspace, userRole, isSuperadmin = false }: WorkspaceCardProps) {
  const getRoleBadge = (role: WorkspaceRole, isSuperadmin: boolean) => {
    if (isSuperadmin) {
      return (
        <Badge variant="default" className="bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-100">
          <Shield className="w-3 h-3 mr-1" />
          Superadmin
        </Badge>
      )
    }
    
    return role === WorkspaceRole.admin ? (
      <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100">
        Admin
      </Badge>
    ) : (
      <Badge variant="secondary">
        Miembro
      </Badge>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{workspace.name}</CardTitle>
          </div>
          {getRoleBadge(userRole, isSuperadmin)}
        </div>
        {workspace.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {workspace.description}
          </p>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>Workspace</span>
          </div>
          <div className="text-muted-foreground/60">
            /{workspace.slug}
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/w/${workspace.slug}`}>
            Acceder
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}