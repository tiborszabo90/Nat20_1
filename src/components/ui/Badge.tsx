import type { ReactNode } from 'react'

export type BadgeVariant = 'accent' | 'magic' | 'danger' | 'success' | 'neutral' | 'muted'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  accent:  'bg-amber-700/60 text-amber-100',
  magic:   'bg-violet-700/60 text-violet-200',
  danger:  'bg-red-700/60 text-red-200',
  success: 'bg-green-800/60 text-green-200',
  neutral: 'bg-gray-700/60 text-gray-300',
  muted:   'bg-surface-raised text-text-muted',
}

export function Badge({ children, variant = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'px-3 py-1 rounded-badge text-xs font-bold uppercase tracking-wider',
        VARIANT_CLASSES[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}
