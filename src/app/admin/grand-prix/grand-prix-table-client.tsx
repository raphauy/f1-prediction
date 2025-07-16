'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { GrandPrixActionsClient } from './grand-prix-actions-client'
import type { GrandPrixWithDetails } from '@/services/grand-prix-service'
import { Clock, MapPin, Flag } from 'lucide-react'
import { DeadlineDisplay } from './deadline-display'

interface GrandPrixTableClientProps {
  grandPrix: GrandPrixWithDetails[]
  seasons: { id: string; name: string; year: number }[]
}

export function GrandPrixTableClient({ grandPrix, seasons }: GrandPrixTableClientProps) {
  const [selectedSeason, setSelectedSeason] = useState<string>('all')
  
  const filteredGrandPrix = selectedSeason === 'all' 
    ? grandPrix 
    : grandPrix.filter(gp => gp.seasonId === selectedSeason)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por temporada" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las temporadas</SelectItem>
            {seasons.map((season) => (
              <SelectItem key={season.id} value={season.id}>
                {season.name} ({season.year})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Ronda</TableHead>
              <TableHead className="min-w-[250px]">Grand Prix</TableHead>
              <TableHead>Clasificación</TableHead>
              <TableHead>Carrera</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-center">Preguntas</TableHead>
              <TableHead className="text-center">Predicciones</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGrandPrix.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No hay Grand Prix registrados
                </TableCell>
              </TableRow>
            ) : (
              filteredGrandPrix.map((gp) => (
                <TableRow key={gp.id}>
                  <TableCell className="font-medium text-center">
                    {gp.round}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{gp.name}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{gp.location}, {gp.country}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        {gp.formattedDates?.qualifyingLocal && (
                          <span>{gp.formattedDates.qualifyingLocal.split(' ').slice(0, 3).join(' ')}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {gp.formattedDates?.qualifyingLocal && (
                          <span>{gp.formattedDates.qualifyingLocal.split(' ').slice(3).join(' ')}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Flag className="h-3 w-3" />
                        {gp.formattedDates?.raceLocal && (
                          <span>{gp.formattedDates.raceLocal.split(' ').slice(0, 3).join(' ')}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {gp.formattedDates?.raceLocal && (
                          <span>{gp.formattedDates.raceLocal.split(' ').slice(3).join(' ')}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <DeadlineDisplay 
                        deadline={new Date(gp.qualifyingDate)} 
                        showTimeRemaining={true}
                      />
                      {gp.isSprint && (
                        <Badge variant="outline" className="text-xs">
                          Sprint
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {gp._count?.gpQuestions || 0}
                  </TableCell>
                  <TableCell className="text-center">
                    {gp._count?.predictions || 0}
                  </TableCell>
                  <TableCell>
                    <GrandPrixActionsClient grandPrix={gp} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}