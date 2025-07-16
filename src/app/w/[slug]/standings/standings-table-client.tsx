"use client"

import React, { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserStatsRow } from "./user-stats-row"
import { getUserStats } from "./actions"
import { Button } from "@/components/ui/button"
import type { UserPerformanceStats } from "@/services/statistics-service"

interface Standing {
  id: string
  position: number | null
  totalPoints: number
  predictionsCount: number
  trend: number
  user: {
    id: string
    name: string | null
    email: string
  }
}

interface StandingsTableClientProps {
  standings: Standing[]
  currentUserId: string
  workspaceSlug: string
  workspaceSeasonId: string
}

export function StandingsTableClient({ 
  standings, 
  currentUserId, 
  workspaceSlug
}: StandingsTableClientProps) {
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const [loadingStats, setLoadingStats] = useState<string | null>(null)
  const [statsCache, setStatsCache] = useState<Record<string, UserPerformanceStats | null>>({})

  const handleToggleExpand = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null)
      return
    }

    setExpandedUserId(userId)
    
    if (!statsCache[userId]) {
      setLoadingStats(userId)
      try {
        const stats = await getUserStats(userId, workspaceSlug)
        setStatsCache(prev => ({ ...prev, [userId]: stats }))
      } catch (error) {
        console.error("Error loading stats:", error)
      } finally {
        setLoadingStats(null)
      }
    }
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-3 w-3 text-green-500" />
    if (trend < 0) return <TrendingDown className="h-3 w-3 text-red-500" />
    return <Minus className="h-3 w-3 text-muted-foreground" />
  }

  const getTrophyIcon = (position: number | null) => {
    switch (position) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case 2:
        return <Trophy className="h-4 w-4 text-gray-400" />
      case 3:
        return <Trophy className="h-4 w-4 text-orange-600" />
      default:
        return null
    }
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">Pos.</TableHead>
            <TableHead className="w-12"></TableHead>
            <TableHead>Competidor</TableHead>
            <TableHead className="text-center">Predicciones</TableHead>
            <TableHead className="text-right">Puntos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((standing) => {
            const isCurrentUser = standing.user.id === currentUserId
            const isExpanded = expandedUserId === standing.user.id

            return (
              <React.Fragment key={standing.id}>
                <TableRow 
                  className={cn(
                    isCurrentUser && "bg-primary/5 font-medium"
                  )}
                >
                  <TableCell className="text-center font-mono">
                    <div className="flex items-center justify-center gap-1">
                      {getTrophyIcon(standing.position)}
                      <span>{standing.position}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getTrendIcon(standing.trend)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "truncate max-w-[200px] sm:max-w-none",
                        isCurrentUser && "font-semibold"
                      )}>
                        {standing.user.name || standing.user.email.split("@")[0]}
                      </span>
                      {isCurrentUser && (
                        <Badge variant="secondary" className="text-xs">
                          Tú
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {standing.predictionsCount}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <div className="flex items-center justify-end gap-2">
                      <span>{standing.totalPoints}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleExpand(standing.user.id)}
                        className="h-6 w-6 p-0"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <UserStatsRow
                    stats={statsCache[standing.user.id]}
                    loading={loadingStats === standing.user.id}
                  />
                )}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}