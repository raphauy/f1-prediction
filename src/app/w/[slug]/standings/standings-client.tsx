"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Share2, Users } from "lucide-react"
import { exportStandingsToCSV } from "./actions"
import { toast } from "sonner"
import { UserComparisonDialog } from "./user-comparison-dialog"

interface StandingsClientProps {
  workspaceSlug: string
  onSearchChange?: (search: string) => void
  onFilterChange?: (filter: string) => void
}

export function StandingsClient({ workspaceSlug, onSearchChange, onFilterChange }: StandingsClientProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterBy, setFilterBy] = useState("all")
  const [showComparison, setShowComparison] = useState(false)

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    onSearchChange?.(value)
  }

  const handleFilterChange = (value: string) => {
    setFilterBy(value)
    onFilterChange?.(value)
  }

  const handleExport = async () => {
    try {
      const result = await exportStandingsToCSV(workspaceSlug)
      
      // Crear blob y descargar
      const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      
      link.setAttribute("href", url)
      link.setAttribute("download", result.filename)
      link.style.visibility = "hidden"
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("Tabla exportada", {
        description: "La clasificación se ha descargado correctamente.",
      })
    } catch {
      toast.error("Error al exportar", {
        description: "No se pudo exportar la tabla. Intenta nuevamente.",
      })
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Clasificación F1",
          text: "Mira la tabla de posiciones de nuestro juego de predicciones F1",
          url: url,
        })
      } catch {
        // Usuario canceló el compartir
      }
    } else {
      // Copiar al portapapeles como fallback
      try {
        await navigator.clipboard.writeText(url)
        toast.success("Enlace copiado", {
          description: "El enlace se ha copiado al portapapeles.",
        })
      } catch {
        toast.error("Error al compartir", {
          description: "No se pudo compartir el enlace.",
        })
      }
    }
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar competidor..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filtros */}
        <Select value={filterBy} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Con predicciones</SelectItem>
            <SelectItem value="inactive">Sin predicciones</SelectItem>
          </SelectContent>
        </Select>

        {/* Acciones */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowComparison(true)}
            title="Comparar usuarios"
          >
            <Users className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleExport}
            title="Exportar tabla"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleShare}
            title="Compartir"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Diálogo de comparación */}
      <UserComparisonDialog
        open={showComparison}
        onOpenChange={setShowComparison}
        workspaceSlug={workspaceSlug}
      />
    </Card>
  )
}