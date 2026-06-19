import type { CommonButtonProps, ButtonVariant } from '@/interfaces'
import type { PropsWithChildren } from 'react'
import { cn } from '@/utils/cn'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover shadow-md active:scale-95 font-bold',
  secondary: 'bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-200 active:scale-95 font-semibold',
  ghost: 'bg-transparent text-stone-700 hover:bg-stone-100 active:scale-95 font-semibold',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-95 font-bold',
}

export const Button = ({ children, className, variant = 'primary', ...props }: PropsWithChildren<CommonButtonProps>) => (
  <button
    className={cn(
      'inline-flex h-10 cursor-pointer items-center justify-center rounded-full px-5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
      variantClasses[variant],
      className,
    )}
    {...props}
  >
    {children}
  </button>
)
