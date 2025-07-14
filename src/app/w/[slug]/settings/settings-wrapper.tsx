import { auth } from "@/lib/auth"
import { getWorkspaceBySlug, isUserWorkspaceAdmin } from "@/services/workspace-service"
import { notFound, redirect } from "next/navigation"
import { SettingsForm } from "./settings-form"

interface SettingsWrapperProps {
  slug: string
}

export async function SettingsWrapper({ slug }: SettingsWrapperProps) {
  const session = await auth()
  const workspace = await getWorkspaceBySlug(slug)
  
  if (!workspace || !session?.user) {
    notFound()
  }

  const isAdmin = await isUserWorkspaceAdmin(session.user.id, workspace.id)

  if (!isAdmin) {
    redirect(`/w/${slug}`)
  }

  return <SettingsForm workspace={workspace} />
}