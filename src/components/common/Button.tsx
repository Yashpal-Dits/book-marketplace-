import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '@/utils/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-amber-800 text-white hover:bg-amber-900 shadow-sm',
  secondary: 'bg-stone-100 text-stone-900 hover:bg-stone-200 border border-stone-200',
  ghost: 'bg-transparent text-stone-700 hover:bg-stone-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}

export const Button = ({ children, className, variant = 'primary', ...props }: PropsWithChildren<ButtonProps>) => (
  <button
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
      variantClasses[variant],
      className,
    )}
    {...props}
  >
    {children}
  </button>
)
