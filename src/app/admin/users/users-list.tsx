import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, User } from "lucide-react"
import { getAllUsers } from "@/services/user-service"
import { UserActionsClient } from "./user-actions-client"

type User = {
  id: string
  email: string
  name: string | null
  role: string
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export async function UsersList() {
  const users = await getAllUsers()

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

  const getRoleBadge = (role: string) => {
    return role === "superadmin" ? (
      <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        <Shield className="w-3 h-3 mr-1" />
        Superadmin
      </Badge>
    ) : (
      <Badge variant="secondary">
        <User className="w-3 h-3 mr-1" />
        Usuario
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Registrado</TableHead>
              <TableHead>Última actividad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        {user.image && (
                          <AvatarImage 
                            src={user.image} 
                            alt={user.name || user.email}
                            className="object-cover"
                          />
                        )}
                        <AvatarFallback className="bg-gray-100">
                          {getInitials(user.name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {user.name || "Sin nombre"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>{formatDate(user.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <UserActionsClient user={user} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Total: {users.length} usuario{users.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}