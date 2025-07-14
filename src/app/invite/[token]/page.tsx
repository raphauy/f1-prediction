import { Suspense } from "react"
import { InviteAcceptance } from "./invite-acceptance"
import { InviteLoading } from "./invite-loading"

interface InvitePageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Suspense fallback={<InviteLoading />}>
        <InviteAcceptance token={token} />
      </Suspense>
    </div>
  )
}