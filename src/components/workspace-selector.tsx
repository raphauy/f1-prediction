"use client"

import { useState, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WorkspaceAvatar } from "@/components/workspace-avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import type { Workspace } from "@prisma/client"

interface WorkspaceSelectorProps {
  userWorkspaces: {
    workspace: Workspace
  }[]
  currentWorkspace?: Workspace | null
  compact?: boolean
}

export function WorkspaceSelector({
  userWorkspaces,
  currentWorkspace: propCurrentWorkspace,
  compact = false
}: WorkspaceSelectorProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Usar el workspace proporcionado o detectar desde la URL
  const currentWorkspace = useMemo(() => {
    if (propCurrentWorkspace) {
      return propCurrentWorkspace
    }
    
    const workspaceSlugMatch = pathname.match(/^\/w\/([^\/]+)/)
    if (workspaceSlugMatch && workspaceSlugMatch[1] !== "profile" && workspaceSlugMatch[1] !== "settings") {
      const slug = workspaceSlugMatch[1]
      const found = userWorkspaces.find(item => item.workspace.slug === slug)
      if (found) {
        return {
          id: found.workspace.id,
          name: found.workspace.name,
          slug: found.workspace.slug,
          image: found.workspace.image
        }
      }
    }
    return null
  }, [pathname, userWorkspaces, propCurrentWorkspace])


  const handleWorkspaceSelect = (workspaceSlug: string) => {
    setOpen(false)
    router.push(`/w/${workspaceSlug}`)
  }

  return (
    <div className="flex items-center">
      {/* Dropdown selector integrado */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "flex items-center space-x-2 h-auto hover:bg-muted/50",
              compact ? "px-1 py-1" : "px-2 py-1"
            )}
          >
            {currentWorkspace ? (
              <>
                <WorkspaceAvatar 
                  workspace={currentWorkspace}
                  size="sm"
                />
                {!compact && (
                  <span className="font-medium text-sm truncate max-w-[150px]">
                    {currentWorkspace.name}
                  </span>
                )}
              </>
            ) : (
              <>
                <WorkspaceAvatar 
                  workspace={{ name: "Workspace", image: null }}
                  size="sm"
                />
                {!compact && (
                  <span className="font-medium text-sm text-muted-foreground">
                    Seleccionar juego
                  </span>
                )}
              </>
            )}
            <ChevronsUpDown className={cn(
              "text-muted-foreground",
              compact ? "h-3 w-3" : "h-3 w-3 ml-1"
            )} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar juego..." />
            <CommandList>
              <CommandEmpty>No se encontraron juegos.</CommandEmpty>
              <CommandGroup heading="Mis Juegos">
                {userWorkspaces.map((item) => (
                  <CommandItem
                    key={item.workspace.id}
                    value={item.workspace.slug}
                    onSelect={() => handleWorkspaceSelect(item.workspace.slug)}
                    className="flex items-center space-x-3 px-3 py-2"
                  >
                    <WorkspaceAvatar 
                      workspace={item.workspace}
                      size="sm"
                    />
                    <div className="flex flex-col flex-1">
                      <span className="font-medium text-sm">
                        {item.workspace.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        /{item.workspace.slug}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4",
                        currentWorkspace?.id === item.workspace.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}