import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ProfileForm } from "./profile-form"
import { getUserById } from "@/services/user-service"

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  // Obtener el usuario completo con preferencias de notificaciones
  const user = await getUserById(session.user.id)
  
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Administra tu información personal y configuración de cuenta
        </p>
      </div>

      <ProfileForm user={user} />
    </div>
  )
}