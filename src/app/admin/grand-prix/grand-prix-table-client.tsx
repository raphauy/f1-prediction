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
import { Input } from '@/components/ui/input'
import { GrandPrixActionsClient } from './grand-prix-actions-client'
import type { GrandPrixWithDetails } from '@/services/grand-prix-service'
import { MapPin, Rocket, CheckCircle2, Circle, MailX, Pause, Search, X } from 'lucide-react'
import Link from 'next/link'
import { DeadlineDisplay } from './deadline-display'
import { DateDisplay } from './date-display'
import { GPStatus } from '@prisma/client'

interface GrandPrixTableClientProps {
  grandPrix: GrandPrixWithDetails[]
  seasons: { id: string; name: string; year: number }[]
}

export function GrandPrixTableClient({ grandPrix, seasons }: GrandPrixTableClientProps) {
  const [selectedSeason, setSelectedSeason] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  // Aplicar filtros en orden: temporada, estado, búsqueda
  let filteredGrandPrix = selectedSeason === 'all' 
    ? grandPrix 
    : grandPrix.filter(gp => gp.seasonId === selectedSeason)
    
  // Filtrar por estado
  if (selectedStatus !== 'all') {
    filteredGrandPrix = filteredGrandPrix.filter(gp => gp.status === selectedStatus)
  }
  
  // Filtrar por búsqueda (nombre o circuito)
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filteredGrandPrix = filteredGrandPrix.filter(gp => 
      gp.name.toLowerCase().includes(query) ||
      gp.circuit.toLowerCase().includes(query) ||
      gp.location.toLowerCase().includes(query)
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Buscador */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o circuito..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Filtro por estado */}
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value={GPStatus.CREATED}>Abierto</SelectItem>
            <SelectItem value={GPStatus.ACTIVE}>Activo</SelectItem>
            <SelectItem value={GPStatus.PAUSED}>Pausado</SelectItem>
            <SelectItem value={GPStatus.FINISHED}>Finalizado</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Filtro por temporada */}
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
                      <Link 
                        href={`/admin/grand-prix/${gp.id}`}
                        className="font-medium hover:underline"
                      >
                        {gp.name}
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{gp.location}, {gp.country}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DateDisplay 
                      date={gp.qualifyingDate} 
                      gpTimezone={gp.timezone}
                      showIcon={true}
                    />
                  </TableCell>
                  <TableCell>
                    <DateDisplay 
                      date={gp.raceDate} 
                      gpTimezone={gp.timezone}
                      showIcon={true}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {/* Solo mostrar badge Creado si NO se va a mostrar el badge Abierto */}
                      {gp.status === 'CREATED' && gp.isDeadlinePassed && (
                        <Badge variant="secondary" className="gap-1">
                          <Circle className="h-3 w-3" />
                          Creado
                        </Badge>
                      )}
                      {gp.status === 'ACTIVE' && (
                        <div className="flex flex-col gap-1">
                          <Badge variant="default" className="gap-1">
                            <Rocket className="h-3 w-3" />
                            Activo
                          </Badge>
                          {!gp.notificationsSent && (
                            <Badge variant="destructive" className="gap-1 text-xs">
                              <MailX className="h-3 w-3" />
                              Sin notificar
                            </Badge>
                          )}
                        </div>
                      )}
                      {gp.status === 'PAUSED' && (
                        <Badge variant="destructive" className="gap-1">
                          <Pause className="h-3 w-3" />
                          Pausado
                        </Badge>
                      )}
                      {gp.status === 'FINISHED' && (
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Finalizado
                        </Badge>
                      )}
                      {gp.isSprint && (
                        <Badge variant="outline" className="text-xs border-purple-500 text-purple-700 dark:text-purple-400">
                          Sprint
                        </Badge>
                      )}
                      {!gp.isDeadlinePassed && gp.status !== 'FINISHED' && (
                        <DeadlineDisplay 
                          deadline={new Date(gp.qualifyingDate)} 
                          showTimeRemaining={true}
                        />
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