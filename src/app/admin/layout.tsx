import { AdminSidebar } from "./components/admin-sidebar"
import { AdminHeader } from "./components/admin-header"
import { SessionProvider } from "next-auth/react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <AdminSidebar>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-none lg:max-w-6xl lg:mx-auto">
            {children}
          </div>
        </main>
      </AdminSidebar>
    </SessionProvider>
  )
}