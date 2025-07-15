'use client'

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { QuestionTemplate } from '@prisma/client'
import { deleteQuestionTemplateAction } from './actions'

interface QuestionTemplatesActionsClientProps {
  template: QuestionTemplate & {
    _count?: {
      gpQuestions?: number
    }
  }
}

export function QuestionTemplatesActionsClient({ template }: QuestionTemplatesActionsClientProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteQuestionTemplateAction(template.id)
      
      if (result.success) {
        toast.success('Plantilla eliminada correctamente')
        router.refresh()
      } else {
        toast.error(result.error || 'Error al eliminar la plantilla')
      }
    } catch {
      toast.error('Error al eliminar la plantilla')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const canDelete = !template._count?.gpQuestions || template._count.gpQuestions === 0

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/admin/question-templates/${template.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 dark:text-red-400"
            disabled={!canDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La plantilla &quot;{template.text}&quot; será eliminada permanentemente.
              {!canDelete && (
                <span className="block mt-2 text-red-600 dark:text-red-400">
                  Esta plantilla ha sido utilizada en {template._count?.gpQuestions} preguntas y se desactivará en lugar de eliminarse.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting || !canDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}