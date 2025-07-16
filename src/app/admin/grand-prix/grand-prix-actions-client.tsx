'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Trash, HelpCircle, Eye, Trophy } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteGrandPrixAction } from './actions'
import type { GrandPrixWithDetails } from '@/services/grand-prix-service'

interface GrandPrixActionsClientProps {
  grandPrix: GrandPrixWithDetails
}

export function GrandPrixActionsClient({ grandPrix }: GrandPrixActionsClientProps) {
  const router = useRouter()

  const handleDelete = async () => {
    // Confirmación usando toast con promise
    toast.promise(
      deleteGrandPrixAction(grandPrix.id),
      {
        loading: 'Eliminando Grand Prix...',
        success: (result) => {
          if (!result.success) {
            throw new Error(result.error || 'Error al eliminar')
          }
          router.refresh()
          return 'Grand Prix eliminado correctamente'
        },
        error: (err) => err.message || 'Error al eliminar el Grand Prix',
      }
    )
  }

  const confirmDelete = () => {
    toast.custom((t) => (
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg border">
        <p className="font-medium mb-2">¿Estás seguro?</p>
        <p className="text-sm text-muted-foreground mb-4">
          Esta acción no se puede deshacer. Se eliminará permanentemente el Grand Prix
          &quot;{grandPrix.name}&quot; y todas sus preguntas asociadas.
        </p>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.dismiss(t)}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              toast.dismiss(t)
              handleDelete()
            }}
          >
            Eliminar
          </Button>
        </div>
      </div>
    ), {
      duration: Infinity,
    })
  }

  const hasPredictions = (grandPrix._count?.predictions || 0) > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/admin/grand-prix/${grandPrix.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/grand-prix/${grandPrix.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/grand-prix/${grandPrix.id}/questions`}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Configurar preguntas
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/grand-prix/${grandPrix.id}/official-results`}>
            <Trophy className="mr-2 h-4 w-4" />
            Resultados oficiales
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={confirmDelete}
          disabled={hasPredictions}
        >
          <Trash className="mr-2 h-4 w-4" />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}