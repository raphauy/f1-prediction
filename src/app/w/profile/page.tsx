import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user) {
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

      <ProfileForm user={session.user} />
    </div>
  )
}