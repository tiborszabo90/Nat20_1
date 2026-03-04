import type { ReactNode } from 'react'

interface CardProps {
  title?: string
  /** Jobb felső sarokba kerülő tartalom (pl. gomb, badge) */
  action?: ReactNode
  children: ReactNode
  className?: string
}

/** Beágyazott section a kártyán belül (bg-surface-overlay) */
interface CardDetailProps {
  children: ReactNode
  className?: string
}

export function Card({ title, action, children, className = '' }: CardProps) {
  return (
    <div className={`bg-surface-raised rounded-card p-4 ${className}`}>
      {(title || action) && (
        <div className="flex justify-between items-center mb-3">
          {title && (
            <p className="label-m text-text-muted">
              {title}
            </p>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export function CardDetail({ children, className = '' }: CardDetailProps) {
  return (
    <div className={`bg-surface-overlay border border-border rounded-input p-3 ${className}`}>
      {children}
    </div>
  )
}
