import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger' | 'success' | 'neutral'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  children: ReactNode
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent hover:bg-accent-hover text-gray-950 font-bold',
  outline: 'border border-accent hover:bg-accent/10 text-accent font-bold',
  ghost:   'border border-dashed border-border hover:border-border-hover text-text-muted hover:text-text-secondary font-medium',
  danger:  'bg-danger hover:bg-danger-hover text-white font-bold',
  success: 'bg-success hover:bg-success-hover text-white font-bold',
  neutral: 'bg-neutral hover:bg-neutral-hover text-white font-bold',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm:   'px-3 py-1.5 text-sm',
  md:   'py-3 px-6 text-base',
  lg:   'py-4 px-6 text-lg',
  icon: 'w-12 h-12 text-xl',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'rounded-btn transition-colors disabled:opacity-30 disabled:cursor-not-allowed font-display uppercase tracking-wider',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
