import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SessionProvider } from "next-auth/react"

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  // All authenticated users can access workspaces (including superadmins)

  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-6">
          {children}
        </main>
      </div>
    </SessionProvider>
  )
}