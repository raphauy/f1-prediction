import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { getUserByEmail, getUserForAuth } from "@/services/user-service"
import { verifyOtpToken } from "@/services/auth-service"

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) {
          return null
        }

        // Find user using service
        const user = await getUserByEmail(credentials.email as string)

        if (!user) {
          return null
        }

        // Verify OTP using service
        const verifiedToken = await verifyOtpToken({
          userId: user.id,
          token: credentials.otp as string
        })

        if (!verifiedToken) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role || "" // Usar cadena vacía para usuarios normales
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      // Check if user exists in database using service
      const existingUser = await getUserByEmail(user.email!)
      
      if (!existingUser) {
        return false // User doesn't exist
      }
      
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const dbUser = await getUserForAuth(user.email!)
        
        if (dbUser) {
          token.role = dbUser.role || "" // Usar cadena vacía para usuarios normales
          token.id = dbUser.id
          token.name = dbUser.name
          token.image = dbUser.image
        }
      }
      
      // Handle session updates (when user updates profile)
      if (trigger === "update" && session) {
        // Update token with new session data
        if (session.name !== undefined) {
          token.name = session.name
        }
        if (session.image !== undefined) {
          token.image = session.image
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.name = token.name as string
        session.user.image = token.image as string | null
      }
      
      return session
    }
  },
  pages: {
    signIn: '/login',
    verifyRequest: '/login?message=check-email'
  }
})