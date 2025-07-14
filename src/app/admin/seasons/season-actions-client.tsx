'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { deleteSeasonAction, toggleSeasonActiveAction } from './actions'

interface SeasonActionsClientProps {
  season: {
    id: string
    year: number
    name: string
    isActive: boolean
    _count: {
      grandPrix: number
      workspaceSeasons: number
    }
  }
}

export function SeasonActionsClient({ season }: SeasonActionsClientProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar la temporada ${season.year}? Esta acción no se puede deshacer.`)) {
      return
    }
    
    setIsDeleting(true)
    try {
      await deleteSeasonAction(season.id)
      toast.success('Temporada eliminada correctamente')
    } catch {
      toast.error('Error al eliminar la temporada')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleActive = async () => {
    setIsToggling(true)
    try {
      await toggleSeasonActiveAction(season.id, !season.isActive)
      toast.success(
        season.isActive 
          ? 'Temporada desactivada correctamente' 
          : 'Temporada activada correctamente'
      )
    } catch {
      toast.error('Error al cambiar el estado de la temporada')
    } finally {
      setIsToggling(false)
    }
  }

  const canDelete = season._count.grandPrix === 0

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`/admin/seasons/${season.id}/edit`)}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleToggleActive}
            disabled={isToggling}
          >
            {season.isActive ? (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Desactivar
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Activar
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}