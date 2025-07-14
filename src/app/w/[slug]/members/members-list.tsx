import { auth } from "@/lib/auth"
import { getWorkspaceBySlug, getWorkspaceUsers, isUserWorkspaceAdmin } from "@/services/workspace-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Shield, User } from "lucide-react"
import { notFound } from "next/navigation"
import { InviteUserDialog } from "./invite-user-dialog"
import { MemberActionsClient } from "./member-actions-client"

interface MembersListProps {
  slug: string
}

export async function MembersList({ slug }: MembersListProps) {
  const session = await auth()
  const workspace = await getWorkspaceBySlug(slug)
  
  if (!workspace || !session?.user) {
    notFound()
  }

  const workspaceUsers = await getWorkspaceUsers(workspace.id)
  const isCurrentUserAdmin = await isUserWorkspaceAdmin(session.user.id, workspace.id)

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        <Shield className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge variant="secondary">
        <User className="w-3 h-3 mr-1" />
        Miembro
      </Badge>
    )
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Miembros del Workspace</CardTitle>
              <CardDescription>
                {workspaceUsers.length} miembro{workspaceUsers.length !== 1 ? 's' : ''} en {workspace.name}
              </CardDescription>
            </div>
            {isCurrentUserAdmin && (
              <InviteUserDialog workspaceId={workspace.id} workspaceSlug={slug} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Se unió</TableHead>
                  {isCurrentUserAdmin && (
                    <TableHead className="text-right">Acciones</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {workspaceUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isCurrentUserAdmin ? 5 : 4} className="text-center text-muted-foreground">
                      No hay miembros en este workspace
                    </TableCell>
                  </TableRow>
                ) : (
                  workspaceUsers.map((workspaceUser) => (
                    <TableRow key={workspaceUser.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            {workspaceUser.user.image && (
                              <AvatarImage 
                                src={workspaceUser.user.image} 
                                alt={workspaceUser.user.name || workspaceUser.user.email}
                                className="object-cover"
                              />
                            )}
                            <AvatarFallback>
                              {getInitials(workspaceUser.user.name, workspaceUser.user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {workspaceUser.user.name || "Sin nombre"}
                            </div>
                            {workspaceUser.userId === session.user.id && (
                              <div className="text-xs text-gray-500">(Tú)</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{workspaceUser.user.email}</TableCell>
                      <TableCell>{getRoleBadge(workspaceUser.role)}</TableCell>
                      <TableCell>{formatDate(workspaceUser.createdAt)}</TableCell>
                      {isCurrentUserAdmin && (
                        <TableCell className="text-right">
                          <MemberActionsClient
                            workspaceUser={workspaceUser}
                            workspaceSlug={slug}
                            currentUserId={session.user.id}
                          />
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}