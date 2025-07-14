import { notFound } from 'next/navigation'
import { getWorkspaceById } from '@/services/workspace-service'
import { WorkspaceEditForm } from '../../workspace-edit-form'

interface EditWorkspacePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditWorkspacePage({ params }: EditWorkspacePageProps) {
  const { id } = await params
  const workspace = await getWorkspaceById(id)
  
  if (!workspace) {
    notFound()
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Workspace</h1>
        <p className="text-muted-foreground">
          Modifica la configuración del workspace {workspace.name}
        </p>
      </div>

      <WorkspaceEditForm workspace={workspace} />
    </div>
  )
}