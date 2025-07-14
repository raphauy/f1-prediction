import { auth } from "@/lib/auth"
import { getInvitationByToken } from "@/services/invitation-service"
import { getUserByEmail } from "@/services/user-service"
import { InviteValid } from "./invite-valid"
import { InviteExpired } from "./invite-expired"
import { InviteNotFound } from "./invite-not-found"
import { InviteAlreadyAccepted } from "./invite-already-accepted"

interface InviteAcceptanceProps {
  token: string
}

export async function InviteAcceptance({ token }: InviteAcceptanceProps) {
  // Obtener la invitación por token
  const invitation = await getInvitationByToken(token)

  // Casos de error
  if (!invitation) {
    return <InviteNotFound />
  }

  if (invitation.acceptedAt) {
    return <InviteAlreadyAccepted invitation={invitation} />
  }

  if (invitation.expiresAt < new Date()) {
    return <InviteExpired invitation={invitation} />
  }

  // Verificar si el usuario está autenticado
  const session = await auth()
  
  // Verificar si ya existe un usuario con este email
  const existingUser = await getUserByEmail(invitation.email)

  // Determinar el estado del usuario
  const userState = {
    isAuthenticated: !!session?.user,
    isCurrentUser: session?.user?.email === invitation.email,
    hasAccount: !!existingUser,
    needsOnboarding: existingUser ? !existingUser.isOnboarded : true,
    user: existingUser
  }

  return (
    <InviteValid 
      invitation={{
        ...invitation,
        token // Pasar el token de la URL
      }} 
      userState={userState}
      session={session}
    />
  )
}