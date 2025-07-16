import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function StandingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/w">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a workspaces
            </Button>
          </Link>
        </div>
      </nav>
      {children}
    </>
  )
}