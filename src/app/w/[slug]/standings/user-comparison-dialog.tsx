"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { compareUsers, getUsersForComparisonAction } from "./actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { UserPerformanceStats } from "@/services/statistics-service"

interface UserComparisonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceSlug: string
}

interface UserForComparison {
  id: string
  name: string
  email: string
  position: number | null
  totalPoints: number
}

interface ComparisonData {
  users: UserPerformanceStats[]
  comparison: {
    round: number
    grandPrixName: string
    userPoints: { userId: string; points: number }[]
  }[]
}

export function UserComparisonDialog({ open, onOpenChange, workspaceSlug }: UserComparisonDialogProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [users, setUsers] = useState<UserForComparison[]>([])
  const [loading, setLoading] = useState(false)
  const [comparing, setComparing] = useState(false)
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)

  // Cargar usuarios cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      const loadUsers = async () => {
        setLoading(true)
        try {
          const usersList = await getUsersForComparisonAction(workspaceSlug)
          setUsers(usersList)
        } catch {
          toast.error("Error al cargar usuarios")
        } finally {
          setLoading(false)
        }
      }
      loadUsers()
    } else {
      // Reset cuando se cierra
      setSelectedUsers([])
      setComparisonData(null)
    }
  }, [open, workspaceSlug])

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId)
      }
      if (prev.length >= 4) {
        toast.error("Máximo 4 usuarios para comparar")
        return prev
      }
      return [...prev, userId]
    })
  }

  const handleCompare = async () => {
    if (selectedUsers.length < 2) {
      toast.error("Selecciona al menos 2 usuarios")
      return
    }

    setComparing(true)
    try {
      const data = await compareUsers(selectedUsers, workspaceSlug)
      setComparisonData(data)
    } catch {
      toast.error("Error al comparar usuarios")
    } finally {
      setComparing(false)
    }
  }

  const getColorForUser = (index: number) => {
    const colors = [
      "text-blue-600 dark:text-blue-400",
      "text-emerald-600 dark:text-emerald-400",
      "text-purple-600 dark:text-purple-400",
      "text-orange-600 dark:text-orange-400"
    ]
    return colors[index % colors.length]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comparar Competidores</DialogTitle>
          <DialogDescription>
            Selecciona entre 2 y 4 competidores para comparar sus estadísticas
          </DialogDescription>
        </DialogHeader>

        {!comparisonData ? (
          <div className="space-y-4">
            {/* Lista de usuarios */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  Seleccionados: {selectedUsers.length}/4
                </p>
                <Button
                  onClick={handleCompare}
                  disabled={selectedUsers.length < 2 || comparing}
                  size="sm"
                >
                  {comparing ? "Comparando..." : "Comparar"}
                </Button>
              </div>

              <ScrollArea className="h-[400px] border rounded-lg p-4">
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className={cn(
                          "flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors",
                          selectedUsers.includes(user.id) && "bg-muted"
                        )}
                        onClick={() => handleUserToggle(user.id)}
                      >
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleUserToggle(user.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Posición #{user.position} • {user.totalPoints} puntos
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Botón para volver */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setComparisonData(null)}
              className="mb-2"
            >
              ← Seleccionar otros
            </Button>

            {/* Resultados de comparación */}
            <div className="space-y-6">
              {/* Resumen */}
              <div>
                <h3 className="text-lg font-medium mb-4">Resumen</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {comparisonData.users.map((user, index) => (
                    <Card key={user.userId} className="h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className={cn("text-lg", getColorForUser(index))}>
                          {users.find(u => u.id === user.userId)?.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center py-2">
                          <p className="text-4xl font-bold">{user.totalPoints}</p>
                          <p className="text-sm text-muted-foreground">Puntos totales</p>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Precisión</span>
                              <span className="font-medium">{user.accuracyRate.toFixed(1)}%</span>
                            </div>
                            <Progress value={user.accuracyRate} className="h-2" />
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span>Predicciones</span>
                            <span className="font-medium">{user.totalPredictions}</span>
                          </div>
                          
                          <div className="flex justify-between text-sm">
                            <span>Aciertos</span>
                            <span className="font-medium">{user.correctPredictions}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Progresión */}
              <div>
                <h3 className="text-lg font-medium mb-4">Progresión</h3>
                <Card>
                  <CardHeader>
                    <CardTitle>Evolución por Gran Premio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-3">
                        {comparisonData.comparison.map((gp) => (
                          <div key={gp.grandPrixName} className="space-y-2 pb-4 border-b last:border-0">
                            <p className="font-medium">{gp.grandPrixName}</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {gp.userPoints.map((up, index) => {
                                const user = users.find(u => u.id === up.userId)
                                return (
                                  <div
                                    key={up.userId}
                                    className="text-center p-3 rounded-lg bg-muted/50 border"
                                  >
                                    <p className={cn("text-sm font-medium mb-1", getColorForUser(index))}>
                                      {user?.name}
                                    </p>
                                    <p className="text-lg font-bold">{up.points}</p>
                                    <p className="text-xs text-muted-foreground">pts</p>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Categorías */}
              <div>
                <h3 className="text-lg font-medium mb-4">Rendimiento por Categoría</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {comparisonData.users.map((user, index) => (
                    <Card key={user.userId}>
                      <CardHeader className="pb-3">
                        <CardTitle className={cn("text-base", getColorForUser(index))}>
                          {users.find(u => u.id === user.userId)?.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {user.pointsByCategory.map((cat) => (
                            <div key={cat.category}>
                              <div className="flex items-center justify-between mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {cat.category}
                                </Badge>
                                <span className="text-sm font-medium">
                                  {cat.points} pts
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress value={cat.accuracy} className="h-1.5 flex-1" />
                                <span className="text-xs text-muted-foreground w-10 text-right">
                                  {cat.accuracy.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}