import { Suspense } from "react"
import { MembersList } from "./members-list"
import { MembersSkeleton } from "./members-skeleton"
import { PendingInvitations } from "./pending-invitations"

interface MembersPageProps {
  params: Promise<{ slug: string }>
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { slug } = await params

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Miembros</h2>
        <p className="text-muted-foreground">
          Gestiona los usuarios del workspace
        </p>
      </div>

      <Suspense fallback={<div>Cargando invitaciones...</div>}>
        <PendingInvitations slug={slug} />
      </Suspense>

      <Suspense fallback={<MembersSkeleton />}>
        <MembersList slug={slug} />
      </Suspense>
    </div>
  )
}