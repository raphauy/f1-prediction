import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string | null
    role: string // "superadmin" o "" para usuarios normales
  }
  
  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}