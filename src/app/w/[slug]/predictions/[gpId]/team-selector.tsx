"use client"

import { useState } from 'react'
import { F1_TEAMS_2025 } from '@/lib/constants/teams'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'

interface TeamSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function TeamSelector({ value, onChange }: TeamSelectorProps) {
  const [search, setSearch] = useState('')
  const isMobile = useMediaQuery('(max-width: 640px)')

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

      <ScrollArea className={cn(
        "rounded-md border",
        isMobile ? "h-[calc(100dvh-360px)]" : "h-[400px]"
      )}>
        <div className="grid grid-cols-1 gap-2 p-2">
          {filteredTeams.map((team) => (
            <button
              key={team.name}
              type="button"
              onClick={() => onChange(team.name)}
              className={cn(
                "flex items-center gap-3 p-3 sm:p-4 rounded-lg border transition-all",
                "hover:bg-muted/50 hover:border-primary/50 active:scale-[0.98]",
                "min-h-[64px] touch-manipulation",
                value === team.name
                  ? "border-primary bg-primary/10"
                  : "border-border"
              )}
            >
              <div 
                className={cn(
                  "rounded-full flex-shrink-0",
                  isMobile ? "h-6 w-2" : "h-8 w-2"
                )}
                style={{ backgroundColor: team.color }}
              />
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">{team.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{team.fullName}</p>
              </div>
              {value === team.name && (
                <Badge variant="default" className="flex-shrink-0 text-xs">
                  <span className="hidden sm:inline">Seleccionado</span>
                  <span className="sm:hidden">✓</span>
                </Badge>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}