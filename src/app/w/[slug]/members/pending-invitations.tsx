import { auth } from "@/lib/auth"
import { getWorkspaceBySlug, isUserWorkspaceAdmin } from "@/services/workspace-service"
import { getWorkspaceInvitations } from "@/services/invitation-service"
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
import { Clock, Mail, Shield, User } from "lucide-react"
import { PendingInvitationActionsClient } from "./pending-invitation-actions-client"

interface PendingInvitationsProps {
  slug: string
}

export async function PendingInvitations({ slug }: PendingInvitationsProps) {
  const session = await auth()
  const workspace = await getWorkspaceBySlug(slug)
  
  if (!workspace || !session?.user) {
    return null
  }

  const isCurrentUserAdmin = await isUserWorkspaceAdmin(session.user.id, workspace.id)
  
  if (!isCurrentUserAdmin) {
    return null
  }

  const invitations = await getWorkspaceInvitations(workspace.id)

  if (invitations.length === 0) {
    return null
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
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

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

  const getTimeUntilExpiration = (expiresAt: Date) => {
    const now = new Date()
    const expiration = new Date(expiresAt)
    const diffInHours = Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours <= 0) {
      return "Expirada"
    } else if (diffInHours < 24) {
      return `${diffInHours}h restantes`
    } else {
      const days = Math.ceil(diffInHours / 24)
      return `${days} día${days !== 1 ? 's' : ''} restantes`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" />
          Invitaciones Pendientes
        </CardTitle>
        <CardDescription>
          {invitations.length} invitación{invitations.length !== 1 ? 'es' : ''} esperando respuesta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Invitado por</TableHead>
                <TableHead>Enviada</TableHead>
                <TableHead>Expira</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{invitation.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(invitation.role)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-7 w-7">
                        {invitation.invitedBy.image && (
                          <AvatarImage 
                            src={invitation.invitedBy.image} 
                            alt={invitation.invitedBy.name || invitation.invitedBy.email}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="bg-gray-100 text-xs">
                          {getInitials(invitation.invitedBy.name, invitation.invitedBy.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {invitation.invitedBy.name || "Sin nombre"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {invitation.invitedBy.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(invitation.createdAt)}</TableCell>
                  <TableCell>
                    <span className={`text-sm ${
                      new Date(invitation.expiresAt) <= new Date() 
                        ? 'text-red-600' 
                        : 'text-amber-600'
                    }`}>
                      {getTimeUntilExpiration(invitation.expiresAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <PendingInvitationActionsClient 
                      invitation={invitation} 
                      workspaceSlug={slug}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}