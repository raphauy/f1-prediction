import { getAllSeasons } from '@/services/season-service'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { SeasonActionsClient } from './season-actions-client'

export async function SeasonsList() {
  const seasons = await getAllSeasons()
  
  if (seasons.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay temporadas creadas</p>
      </div>
    )
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Año</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Fecha Inicio</TableHead>
            <TableHead>Fecha Fin</TableHead>
            <TableHead>Grand Prix</TableHead>
            <TableHead>Workspaces</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {seasons.map((season) => (
            <TableRow key={season.id}>
              <TableCell className="font-medium">{season.year}</TableCell>
              <TableCell>{season.name}</TableCell>
              <TableCell>{formatDate(season.startDate)}</TableCell>
              <TableCell>{formatDate(season.endDate)}</TableCell>
              <TableCell>{season._count.grandPrix}</TableCell>
              <TableCell>{season._count.workspaceSeasons}</TableCell>
              <TableCell>
                {season.isActive ? (
                  <Badge>Activa</Badge>
                ) : (
                  <Badge variant="secondary">Inactiva</Badge>
                )}
              </TableCell>
              <TableCell>
                <SeasonActionsClient season={season} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}