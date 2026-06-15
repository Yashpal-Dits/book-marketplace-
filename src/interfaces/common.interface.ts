import type { ButtonHTMLAttributes, InputHTMLAttributes, PropsWithChildren } from 'react'
import type { Role } from '@/enums/role.enum'

export interface CommonAuthShellProps extends PropsWithChildren {
  mode: 'login' | 'register' | 'seller'
}

export interface CommonProtectedRouteProps extends PropsWithChildren {
  allowedRoles?: Role[]
  requireApprovedSeller?: boolean
}

export interface CommonBookCoverProps {
  src?: string
  title: string
  className?: string
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

export interface CommonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export interface CommonFormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export interface CommonPasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export interface CommonPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export interface CommonRatingStarsProps {
  rating?: number
  className?: string
}

export interface CommonFooterLink {
  label: string
  to?: string
}

export interface CommonFooterColumn {
  heading: string
  links: CommonFooterLink[]
}
