"use client"

import { useState } from 'react'
import { F1_DRIVERS_2025 } from '@/lib/constants/drivers'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/use-media-query'

interface DriverSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function DriverSelector({ value, onChange }: DriverSelectorProps) {
  const [search, setSearch] = useState('')
  const isMobile = useMediaQuery('(max-width: 640px)')

  const filteredDrivers = F1_DRIVERS_2025.filter(driver =>
    driver.name.toLowerCase().includes(search.toLowerCase()) ||
    driver.team.toLowerCase().includes(search.toLowerCase())
  )

  // Agrupar pilotos por equipo
  const driversByTeam = filteredDrivers.reduce((acc, driver) => {
    if (!acc[driver.team]) {
      acc[driver.team] = []
    }
    acc[driver.team].push(driver)
    return acc
  }, {} as Record<string, typeof F1_DRIVERS_2025>)

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Buscar piloto o equipo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full"
      />

      <ScrollArea className={cn(
        "pr-4",
        isMobile ? "h-[calc(100dvh-360px)]" : "h-[400px]"
      )}>
        <div className="space-y-4 sm:space-y-6">
          {Object.entries(driversByTeam).map(([team, drivers]) => (
            <div key={team} className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground px-1">{team}</h3>
              <div className="grid grid-cols-1 gap-2">
                {drivers.map((driver) => (
                  <button
                    key={driver.name}
                    type="button"
                    onClick={() => onChange(driver.name)}
                    className={cn(
                      "flex items-center gap-3 p-3 sm:p-4 rounded-lg border transition-all",
                      "hover:bg-muted/50 hover:border-primary/50 active:scale-[0.98]",
                      "min-h-[68px] touch-manipulation",
                      value === driver.name
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    )}
                  >
                    <div className={cn(
                      "relative rounded-full overflow-hidden bg-muted flex-shrink-0",
                      isMobile ? "h-11 w-11" : "h-12 w-12"
                    )}>
                      {driver.imageUrl ? (
                        <Image
                          src={driver.imageUrl}
                          alt={driver.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-base sm:text-lg font-bold">
                          {driver.number}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{driver.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">#{driver.number}</p>
                    </div>
                    {value === driver.name && (
                      <Badge variant="default" className="flex-shrink-0 text-xs">
                        <span className="hidden sm:inline">Seleccionado</span>
                        <span className="sm:hidden">✓</span>
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}