import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Role } from '@/enums/role.enum'
import { SellerStatus } from '@/enums/seller-status.enum'
import { useAuthStore } from '@/store/auth.store'

interface ProtectedRouteProps extends PropsWithChildren {
  allowedRoles?: Role[]
  requireApprovedSeller?: boolean
}

export const ProtectedRoute = ({ children, allowedRoles, requireApprovedSeller = false }: ProtectedRouteProps) => {
  const { user, isAuthenticated, sellerStatus } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  if (requireApprovedSeller && sellerStatus !== SellerStatus.APPROVED) {
    return <Navigate to="/seller/pending-approval" replace />
  }

  return children
}
