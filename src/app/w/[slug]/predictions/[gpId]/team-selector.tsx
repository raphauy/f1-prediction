"use client"

import { useState } from 'react'
import { F1_TEAMS_2025 } from '@/lib/constants/teams'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface TeamSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function TeamSelector({ value, onChange }: TeamSelectorProps) {
  const [search, setSearch] = useState('')

  const filteredTeams = F1_TEAMS_2025.filter(team =>
    team.name.toLowerCase().includes(search.toLowerCase()) ||
    team.fullName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Buscar equipo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full"
      />

      <ScrollArea className="h-[300px] rounded-md border p-2">
        <div className="grid grid-cols-1 gap-2">
          {filteredTeams.map((team) => (
            <button
              key={team.name}
              type="button"
              onClick={() => onChange(team.name)}
              className={cn(
                "flex items-center gap-3 p-4 rounded-lg border transition-all",
                "hover:bg-muted/50 hover:border-primary/50",
                value === team.name
                  ? "border-primary bg-primary/10"
                  : "border-border"
              )}
            >
              <div 
                className="h-8 w-2 rounded-full"
                style={{ backgroundColor: team.color }}
              />
              <div className="flex-1 text-left">
                <p className="font-medium">{team.name}</p>
                <p className="text-sm text-muted-foreground">{team.fullName}</p>
              </div>
              {value === team.name && (
                <Badge variant="default">Seleccionado</Badge>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}