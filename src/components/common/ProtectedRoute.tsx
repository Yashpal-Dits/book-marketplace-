import type { CommonProtectedRouteProps } from '@/interfaces'
import { Navigate, useLocation } from 'react-router-dom'
import { Role } from '@/enums/role.enum'
import { SellerStatus } from '@/enums/seller-status.enum'
import { useAuthStore } from '@/store/auth.store'

const getRoleHomePath = (role: Role, sellerStatus?: string) => {
  if (role === Role.ADMIN) return '/admin/dashboard'
  if (role === Role.SELLER) {
    return sellerStatus === SellerStatus.APPROVED ? '/seller/dashboard' : '/seller/pending-approval'
  }
  return '/'
}

export const ProtectedRoute = ({ children, allowedRoles, requireApprovedSeller = false }: CommonProtectedRouteProps) => {
  const { user, isAuthenticated, sellerStatus, impersonatedSellerId } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleHomePath(user.role, sellerStatus)} replace />
  }

  if (requireApprovedSeller && user.role === Role.ADMIN) {
    return impersonatedSellerId ? children : <Navigate to="/admin/sellers" replace />
  }

  if (requireApprovedSeller && sellerStatus !== SellerStatus.APPROVED) {
    return <Navigate to="/seller/pending-approval" replace />
  }

  return children
}
