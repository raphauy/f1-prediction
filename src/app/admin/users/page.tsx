import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { UsersList } from "./users-list"
import { UsersTableSkeleton } from "./users-table-skeleton"

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h2>
          <p className="text-muted-foreground">
            Administra los usuarios del sistema y sus roles
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            Todos los usuarios registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<UsersTableSkeleton />}>
            <UsersList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}