import { cn } from '@/lib/utils'

interface WorkspaceAvatarProps {
  workspace: {
    name: string
    image?: string | null
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function WorkspaceAvatar({ workspace, className, size = 'md' }: WorkspaceAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg'
  }

  if (workspace.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={workspace.image}
        alt={workspace.name}
        className={cn(
          'rounded-lg object-cover',
          sizeClasses[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg bg-primary/10 flex items-center justify-center font-semibold text-primary',
        sizeClasses[size],
        className
      )}
    >
      {getInitials(workspace.name)}
    </div>
  )
}