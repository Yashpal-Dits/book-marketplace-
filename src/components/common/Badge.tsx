import type { PropsWithChildren } from 'react'
import { cn } from '@/utils/cn'

export const Badge = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
  <span className={cn('inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900', className)}>{children}</span>
)
